import { Status } from "@prisma/client";
import { db } from "~/service/db.server";
import { getUnassignedBatch } from "./server.group";

export async function checkAndAssignBatch(userId: string) {
  try {
    let batchToAssign = null;
    // 1. Retrieve the user's current assigned batches (if any)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        assigned_batch: true,
        ignored_list: true,
        categories: true,
      },
    });
    let assigned_batch = user?.assigned_batch;
    if (!user) return null;
    if (assigned_batch?.length === 0) {
      batchToAssign = await getUnassignedBatch(user.categories);
    } else {
      let textsInBatch = await db.text.findMany({
        where: {
          batch: { in: user.assigned_batch },
        },
        select: {
          status: true,
          modified_text: true,
          batch: true,
          reviewed: true,
        },
      });
      for (const batch of user.assigned_batch) {
        let batchList = textsInBatch.filter((item) => item.batch === batch);
        // If there is any text with a null modified_text, return false
        if (batchList.some((text) => text.modified_text === null)) {
          return batch;
        }
        if (
          batchList.some(
            (text) => text.status === null || text.status === "PENDING"
          )
        ) {
          return batch;
        }
      }
      //check if all assigned batch is accepted

      if (!batchToAssign) {
        batchToAssign = await getUnassignedBatch(user.categories);
      }
    }
    // 3. Assign the batch to the user
    if (!batchToAssign) return null;
    if (!user?.assigned_batch?.includes(batchToAssign)) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          assigned_batch: {
            set: [...(user?.assigned_batch || []), batchToAssign],
          },
        },
      });
    }
    return batchToAssign;
  } catch (error) {
    console.error(
      "An error occurred while checking and assigning batch:",
      error
    );
    throw error;
  }
}

export async function getTextToDisplay(userId: string, history: any) {
  if (history) {
    const text = await db.text.findUnique({
      where: { id: parseInt(history) },
    });
    let show = text?.modified_text
      ? JSON.parse(text?.modified_text).join(" ")
      : text?.original_text;
    return {
      ...text,
      id: text?.id,
      original_text: show,
      status: text?.status,
    };
  }
  let batch = await checkAndAssignBatch(userId);
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ignored_list: true,
      rejected_list: true,
    },
  });
  const rejectedIds = user?.rejected_list.map((item: any) => item.id) || [];
  let text = await db.text.findFirst({
    where: {
      batch: batch,
      OR: [{ status: null }, { status: "PENDING" }],
    },
    orderBy: {
      id: "asc",
    },
  });
  if (!text) return null;
  return text;
}

export async function getProgress() {
  try {
    let total_count = await db.text.count();
    let reviewed_count = await db.text.count({
      where: { reviewed: true },
    });
    return { total: total_count, reviewed: reviewed_count };
  } catch (e) {
    throw new Error(e);
  }
}

export async function rejectText(id: number, userId: string) {
  let text = await db.text.update({
    where: {
      id,
    },
    data: {
      status: "REJECTED",
      modified_by: { disconnect: { id: userId } },
      rejected_by: { connect: { id: userId } },
      reviewed: false,
    },
  });
  return text;
}
export async function removeRejectText(
  id: number,
  userId: string,
  status: Status
) {
  let text = db.text.update({
    where: {
      id,
    },
    data: {
      status,
      rejected_by: { disconnect: { id: userId } },
    },
  });
  let user = db.user.update({
    where: {
      id: userId,
    },
    data: {
      text: {
        connect: { id },
      },
    },
  });
  return text;
}

export function saveText(
  id: number,
  text: string,
  userId: string,
  adminId: string,
  time?: string
) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: JSON.stringify(text.split(" ")),
      modified_by_id: userId,
      status: "APPROVED",
      rejected_by: { disconnect: { id: userId } },
      reviewed: !!adminId,
      reviewed_by_id: adminId || null,
      duration: time || null,
    },
  });
}

export async function getAprovedBatch() {
  let data = await db.text.findMany({
    select: {
      batch: true,
    },
  });
  const uniqueGroups = new Set();
  const result = {};
  data.forEach((item) => {
    uniqueGroups.add(item.batch);
  });
  let text_group = await db.text.findMany({
    where: {
      batch: { in: Array.from(uniqueGroups) },
    },
    select: {
      id: true,
      status: true,
      batch: true,
      ignored_by: true,
      reviewed: true,
    },
  });
  for (const item of uniqueGroups) {
    let text = text_group.filter((t) => t.batch === item);
    let approved = text.every((item) => item.status === "APPROVED");
    let reviewed = text.every((item) => item.reviewed === true);
    let rejected = text.some((item) => item.status === "REJECTED");

    result[item] = { approved, rejected, reviewed };
  }

  return result;
}
export async function getNumberOfReject(id: number) {
  try {
    let text = await db.text.findUnique({
      where: { id },
      select: { reject_count: true },
    });
    return text?.reject_count || 0;
  } catch (e) {
    throw new Error(e);
  }
}
export async function updateTextRejectCount(id: number) {
  try {
    let text = await db.text.update({
      where: { id },
      data: {
        reject_count: { increment: 1 },
      },
    });
    return text?.reject_count || 0;
  } catch (e) {
    throw new Error(e);
  }
}
export async function changeCategory(version: string, category: string) {
  try {
    let text = await db.text.updateMany({
      where: { version },
      data: {
        category,
      },
    });
    return text.count;
  } catch (e) {
    throw new Error(e);
  }
}
export async function deleteTextByVersion(version: string) {
  try {
    let deleted = await db.text.deleteMany({
      where: { version },
    });
    return deleted.count;
  } catch (e) {
    throw new Error(e + "cannot delete");
  }
}
export async function getLastBatch() {
  let batch = await db.text.findFirst({
    select: {
      batch: true,
    },
    orderBy: {
      batch: "desc",
    },
  });
  return batch?.batch || 0;
}
