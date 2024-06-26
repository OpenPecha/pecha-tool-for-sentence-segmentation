import { Status } from "@prisma/client";
import { db } from "~/service/db.server";
import { getUnassignedBatch } from "./group.server";

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
      ? JSON.parse(text?.modified_text).join("\n")
      : text?.original_text;
    if (!text) return { error: { message: "no History on that ID" } };
    return {
      ...text,
      id: text?.id,
      original_text: show,
      status: text?.status,
    };
  }

  let RemainingWork = await db.text.findFirst({
    where: {
      modified_by_id: userId,
      modified_text: null,
      original_text: { not: "" },
      status: { not: "TRASHED" },
      OR: [{ reviewed: false }, { reviewed: null }],
    },
  });
  if (RemainingWork) return RemainingWork;

  let unassignedWork = await db.text.findFirst({
    where: {
      modified_by_id: null,
      modified_text: null,
      original_text: { not: "" },
      OR: [{ status: "PENDING" }, { status: null }],
    },
    orderBy: {
      id: "asc",
    },
  });
  if (!unassignedWork) {
    return { error: { message: "no text available" } };
  }
  let assignText = await db.text.update({
    where: {
      id: unassignedWork?.id,
    },
    data: {
      modified_by_id: userId,
      status: "PENDING",
    },
  });
  return assignText;
}

export async function getProgress() {
  try {
    const [total_count, reviewed_count, accepted_count] = await Promise.all([
      db.text.count(),
      db.text.count({
        where: { reviewed: true },
      }),
      db.text.count({
        where: {
          status: "APPROVED",
          reviewed_text: null,
        },
      }),
    ]);

    return {
      total: total_count,
      reviewed: reviewed_count,
      accepted: accepted_count,
    };
  } catch (e) {
    throw new Error(e);
  }
}

export async function trashText(
  id: number,
  userId: string,
  isReviewer: boolean
) {
  let text = await db.text.update({
    where: {
      id,
    },
    data: {
      status: "TRASHED",
      modified_by: { connect: { id: userId } },
      modified_text: null,
      reviewed: !!isReviewer,
    },
  });
  return text;
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
  reviewed_text: string,
  userId: string,
  adminId: string,
  time?: string
) {
  let isReviewer = !!adminId;
  let duration = time ? parseFloat(time) : null;
  let word_count = text
    ?.split("་")
    .filter((word) => !word.includes("།")).length;
  if (!isReviewer) {
    return db.text.update({
      where: {
        id,
      },
      data: {
        modified_text: text,
        modified_by_id: userId,
        reviewed: false,
        status: "APPROVED",
        rejected_by: { disconnect: { id: userId } },
        duration,
        modified_on: new Date(),
        word_count,
      },
    });
  } else {
    return db.text.update({
      where: {
        id,
      },
      data: {
        reviewed_text: reviewed_text,
        status: "APPROVED",
        rejected_by: { disconnect: { id: userId } },
        reviewed: true,
        reviewed_by_id: adminId,
      },
    });
  }
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

export async function delete_modified({ id }: { id: string }) {
  return await db.text.update({
    where: { id: parseInt(id) },
    data: {
      modified_text: null,
    },
  });
}

export async function getMonthlyWordCount(userId: string) {
  let data = await db.text.findMany({
    where: { modified_by_id: userId, reviewed: true },
    select: {
      modified_on: true,
      word_count: true,
    },
  });
  const monthlyData = {};
  data.forEach((entry) => {
    const monthYear = entry?.modified_on?.toISOString().substr(0, 7); // Extract month and year (format: "YYYY-MM")
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    monthlyData[monthYear] += entry.word_count;
  });

  return monthlyData;
}
