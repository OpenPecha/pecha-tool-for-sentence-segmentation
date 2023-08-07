import { User } from "@prisma/client";
import { db } from "~/service/db.server";
function customSort(a, b) {
  let sliced_a = a.slice(0, -1).replace("gen_", "");
  let sliced_b = b.slice(0, -1).replace("gen_", "");

  return sliced_a - sliced_b;
}
async function getCountOfbatch(batch: string[]) {
  try {
    const data = await db.text.findMany({
      where: {
        batch: { in: batch },
      },
    });
    return data.length;
  } catch (e) {
    console.log(e);
    return 0;
  }
}
async function getCountOfbatchforreview(batch: string[]) {
  const uniquebatchs = new Set();
  batch.forEach((item) => {
    uniquebatchs.add(item.slice(0, -1) + "a");
    uniquebatchs.add(item.slice(0, -1) + "b");
  });
  let batches_numbers = Array.from(uniquebatchs).sort(customSort);
  try {
    const data = await db.text.findMany({
      where: {
        batch: { in: batches_numbers },
      },
    });
    return data.length;
  } catch (e) {
    console.log(e);
    return 0;
  }
}
async function get_not_asigned_batch(batch?: string[]) {
  let { unassigned } = await getBatchs();
  let batchFormat = batch?.map((p) => p.slice(0, -1));
  if (batch?.length) {
    unassigned = unassigned.filter((item: string) => {
      let data = item.slice(0, -1);
      return !batchFormat?.includes(data);
    });
  }
  return unassigned[0] || "";
}
async function get_not_asigned_review_batch() {
  let { assigned } = await getBatchs();
  const uniquebatchs = new Set();
  assigned.forEach((item) => {
    uniquebatchs.add(item.slice(0, -1));
  });
  let batches_numbers = Array.from(uniquebatchs).sort(customSort);
  let ready_for_review = [];
  let pros = batches_numbers.map(async (item) => {
    let ga = await db.text.findFirst({
      where: {
        batch: item + "a",
        reviewed_text: null,
      },
      select: {
        id: true,
        modified_text: true,
        order: true,
        original_text: true,
      },
      orderBy: { order: "asc" },
    });
    let gb = await db.text.findFirst({
      where: {
        id: ga?.id.replace("a", "b"),
        reviewed_text: null,
      },
      select: {
        id: true,
        modified_text: true,
        order: true,
        original_text: true,
      },
      orderBy: { order: "asc" },
    });
    if (ga?.modified_text && gb?.modified_text) {
      let data = item + "c";
      return data;
    }
  });
  ready_for_review = await Promise.all(pros);
  return ready_for_review[0] || "";
}

export async function checkAndAssignBatch(userSession: User) {
  try {
    const user = await db.user.findUnique({
      where: { username: userSession.username },
      select: {
        assigned_batch: true,
        assigned_batch_for_review: true,
        approved_text: { select: { batch: true } },
        ignored_list: { select: { batch: true } },
        rejected_list: { select: { batch: true } },
        reviewed_list: { select: { batch: true } },
        role: true,
      },
    });

    if (!user) return null;

    let asignedbatch = user?.assigned_batch[user?.assigned_batch.length - 1];
    let reviewbatch =
      user?.assigned_batch_for_review[
        user?.assigned_batch_for_review.length - 1
      ];

    if (reviewbatch && user.role === "reviewer") {
      let count = await getCountOfbatchforreview(
        user?.assigned_batch_for_review
      );
      console.log(user.reviewed_list.length, count);
      if (user.reviewed_list.length === count) {
        let batch: string | "" = await get_not_asigned_review_batch();
        if (batch === "") {
          // If not available, assign a text to the reviewer
          batch = await get_not_asigned_batch();
          await db.user.update({
            where: { username: userSession.username },
            data: {
              assigned_batch: { push: batch },
            },
          });
        } else {
          // If available, assign a text to the reviewer
          await db.user.update({
            where: { username: userSession.username },
            data: {
              assigned_batch_for_review: { push: batch },
            },
          });
        }
      }
      return reviewbatch;
    }
    if (asignedbatch) {
      // if user is a reviewer, check if there is a batch to review
      if (user.role === "reviewer") {
        let batch = await get_not_asigned_review_batch();
        if (batch !== "") {
          await db.user.update({
            where: { username: userSession.username },
            data: {
              assigned_batch_for_review: { push: batch },
            },
          });
          return batch;
        }
      }
      // Check if work complete
      const workedBatch = [
        ...(user?.approved_text || []),
        ...(user?.rejected_list || []),
        ...(user?.ignored_list || []),
      ];

      if (
        workedBatch.length === (await getCountOfbatch(user?.assigned_batch))
      ) {
        let batch = await get_not_asigned_batch(user?.assigned_batch);
        await db.user.update({
          where: { username: userSession.username },
          data: { assigned_batch: { push: batch } },
        });
        return batch;
      }
      return asignedbatch;
    }
    if (!asignedbatch || !reviewbatch) {
      if (user.role === "annotator") {
        // Get text not assigned to anyone
        let batch = await get_not_asigned_batch();
        // Assign a text to the annotator
        await db.user.update({
          where: { username: userSession.username },
          data: {
            assigned_batch: { push: batch },
          },
        });
        return batch;
      }
      if (user.role === "reviewer") {
        // Get review batch
        let batch: string | "" = await get_not_asigned_review_batch();
        if (batch === "") {
          // If not available, assign a text to the reviewer
          batch = await get_not_asigned_batch();
          await db.user.update({
            where: { username: userSession.username },
            data: {
              assigned_batch: { push: batch },
            },
          });
        } else {
          // If available, assign a text to the reviewer
          await db.user.update({
            where: { username: userSession.username },
            data: {
              assigned_batch_for_review: { push: batch },
            },
          });
        }

        return batch;
      }
    }
  } catch (e) {
    console.error("Error in checkAndAssignBatch:", e);
    throw new Error("Unable to assign batch.");
  }
}

export async function getTextToDisplay(
  userSession: User,
  history: string | null
) {
  let userId = userSession.id;
  if (history) {
    const text = await db.text.findUnique({
      where: { id: history },
    });
    let show =
      JSON.parse(text?.modified_text)?.join("\n") || text?.original_text;
    return {
      ...text,
      id: text?.id,
      original_text: show,
      status: text?.status,
    };
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ignored_list: { orderBy: { id: "asc" }, select: { id: true } },
      rejected_list: { orderBy: { id: "asc" }, select: { id: true } },
      approved_text: { orderBy: { id: "asc" }, select: { id: true } },
    },
  });
  let batch = await checkAndAssignBatch(user!);

  if (!batch) return null;
  if (!user) {
    throw new Error("User not found");
  }
  const asignedbatch = batch;
  const ignoredIds = user?.ignored_list.map((item: any) => item.id);
  const rejectedIds = user?.rejected_list.map((item: any) => item.id);
  const text = await db.text.findFirst({
    where: {
      modified_text: null,
      OR: [{ status: null }, { status: "PENDING" }],
      id: {
        notIn: [...(ignoredIds || []), ...(rejectedIds || [])],
      },
      batch: asignedbatch,
    },
    orderBy: {
      order: "asc",
    },
  });
  if (!text) return null;
  return text;
}

export function getTextToDisplayByUser(userid: string) {
  let allTextByUser = db.text.findMany({
    where: {
      modified_by_id: userid,
    },
    select: {
      id: true,
      status: true,
      modified_text: true,
    },
  });
  return allTextByUser;
}

export function resetText(id: string) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: null,
      modified_by_id: null,
      status: "PENDING",
    },
  });
}

export async function rejectText(id: string, userId: string) {
  let text = await db.text.update({
    where: {
      id,
    },
    data: {
      status: "REJECTED",
      modified_by: { disconnect: { id: userId } },
      rejected_by: { connect: { id: userId } },
    },
  });
  return text;
}

export async function ignoreText(id: string, userId: string) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: null,
      ignored_by: { connect: { id: userId } },
      modified_by: { disconnect: { id: userId } },
      rejected_by: { disconnect: { id: userId } },
      status: "PENDING",
    },
  });
}

export function saveText(id: string, text: string, userId: string) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: JSON.stringify(text.split("\n")),
      modified_by_id: userId,
      status: "APPROVED",
      rejected_by: { disconnect: { id: userId } },
      ignored_by: { disconnect: { id: userId } },
    },
  });
}

export async function saveReviewedText(
  ga_id: string,
  gb_id: string,
  text: string,
  userId: string
) {
  let update_ga = await db.text.updateMany({
    where: {
      id: ga_id,
    },
    data: {
      reviewed_text: JSON.stringify(text.split("\n")),
      status: "APPROVED",
      reviewer_id: userId,
    },
  });
  let update_gb = await db.text.updateMany({
    where: {
      id: gb_id,
    },
    data: {
      reviewed_text: JSON.stringify(text.split("\n")),
      status: "APPROVED",
      reviewer_id: userId,
    },
  });

  return { update_ga, update_gb };
}

export async function getBatchs() {
  let data = await db.text.findMany({
    select: {
      batch: true,
    },
  });
  const uniquebatchs = new Set();

  data.forEach((item) => {
    uniquebatchs.add(item.batch);
  });

  let numbers = Array.from(uniquebatchs).sort(customSort);

  const users = await db.user.findMany({
    select: { assigned_batch: true },
  });
  const assignedbatchs = users.flatMap((user) => user.assigned_batch);
  const unassignedNumbers = numbers.filter(
    (number) => !assignedbatchs.includes(number)
  );
  return {
    unassigned: unassignedNumbers,
    assigned: assignedbatchs,
  };
}

export async function getTextInfo() {
  try {
    let text = await db.text.findMany({
      select: {
        id: true,
        status: true,
      },
    });
    let total = text.length;
    let accepted = text.filter((item) => item.status === "APPROVED").length;
    let rejected = text.filter((item) => item.status === "REJECTED").length;
    let pending = text.filter((item) => item.status === "PENDING").length;

    return { total, accepted, rejected, pending };
  } catch (e) {
    throw new Error(e);
  }
}

export async function getAprovedbatch() {
  let data = await db.text.findMany({
    select: {
      batch: true,
    },
  });
  const uniquebatchs = new Set();
  const result = {};
  data.forEach((item) => {
    uniquebatchs.add(item.batch);
  });
  for (const item of uniquebatchs) {
    let text = await db.text.findMany({
      where: {
        batch: item,
      },
      select: {
        id: true,
        status: true,
        ignored_by: true,
      },
    });
    let approved = text.every((item) => item.status === "APPROVED");
    let rejected = text.some((item) => item.status === "REJECTED");
    const ignored = text.reduce((acc, t) => {
      const ignoredUsersWithNonNullUsername = t.ignored_by.filter(
        (user) => user.username !== null
      );
      const ignoredUsernames = ignoredUsersWithNonNullUsername.map(
        (user) => user.username
      );
      return acc.concat(ignoredUsernames);
    }, []);

    result[item] = { approved, rejected, ignored };
  }

  return result;
}

export async function getUnReviewedList() {
  const texts = await db.text.findMany({
    where: {
      OR: [
        {
          batch: { startsWith: "a" },
          status: "APPROVED",
        },
        {
          batch: { startsWith: "b" },
          status: "APPROVED",
        },
      ],
    },
  });
  const users = await db.user.findMany({
    select: {
      assigned_batch_for_review: true,
    },
  });
  const mergedArray = users.flat().reduce((result, item) => {
    return result.concat(item?.assigned_batch_for_review);
  }, []);
  let result = await getApprovedbatchs(texts);
  let final = result.filter((item) => !mergedArray.includes(item));
  return final;
}

export async function getReviewedBatch() {
  const texts = await db.text.findMany({
    where: {
      OR: [
        {
          batch: { startsWith: "ga" },
          status: "APPROVED",
        },
        {
          batch: { startsWith: "gb" },
          status: "APPROVED",
        },
      ],
    },
  });
  let result = await getApprovedbatchs(texts);
  let data = await getTextReviewStatus(result);
  return data;
}

export async function getAsignedReviewText(user: User, history: string | null) {
  if (history) {
    const text = await db.text.findUnique({
      where: { id: history },
    });
    let original_text =
      JSON.parse(text?.modified_text)?.join("\n") || text?.original_text;
    return {
      text: {
        ...text,
        id: text?.id,
        original_text,
        status: text?.status,
      },
      review: false,
    };
  }
  try {
    let batch: string = await checkAndAssignBatch(user!);
    if (batch.endsWith("c")) {
      let ga = await db.text.findFirst({
        where: {
          batch: batch.replace("c", "a"),
          reviewed_text: null,
        },
        select: {
          id: true,
          modified_text: true,
          order: true,
          original_text: true,
        },
        orderBy: { order: "asc" },
      });
      let gb_id = ga?.id.replace("a_", "b_");
      let gb = await db.text.findFirst({
        where: {
          id: gb_id,
          reviewed_text: null,
        },
        select: {
          id: true,
          modified_text: true,
          order: true,
          original_text: true,
        },
      });
      let review = true;
      return { ga, gb, review };
    } else {
      const asignedbatch = batch;
      const ignoredIds = user?.ignored_list.map((item: any) => item.id);
      const rejectedIds = user?.rejected_list.map((item: any) => item.id);
      const text = await db.text.findFirst({
        where: {
          modified_text: null,
          OR: [{ status: null }, { status: "PENDING" }],
          id: {
            notIn: [...(ignoredIds || []), ...(rejectedIds || [])],
          },
          batch: asignedbatch,
        },
        orderBy: {
          order: "asc",
        },
      });
      let review = false;
      if (!text) return null;
      return { text, review };
    }
  } catch (e) {
    throw new Error("cannot get asigned review text");
  }
}

const getApprovedbatchs = async (data) => {
  const batchStatus = {};

  data.forEach((item) => {
    const { batch, id } = item;
    if (!batchStatus[batch]) {
      batchStatus[batch] = [];
    }
    batchStatus[batch].push(id);
  });

  const result = await checkApprovedbatchs(batchStatus);
  console.log(result);
  return result;
};

async function checkApprovedbatchs(batchStatus) {
  const result = [];

  for (const key in batchStatus) {
    const count = parseInt(key.slice(3));
    if (key.startsWith("ga_")) {
      const correspondingKey = `gb${key.slice(2)}`;
      if (
        correspondingKey in batchStatus &&
        batchStatus[key].length === batchStatus[correspondingKey].length &&
        batchStatus[key].length === (await getCountOfbatch(count))
      ) {
        result.push(key);
      }
    }
  }

  return result;
}
async function getTextReviewStatus(batchArray) {
  try {
    const reviewStatus = {};

    for (const batch of batchArray) {
      const texts = await db.text.findMany({
        where: {
          batch: batch,
        },
      });

      // Check if any of the fetched texts have 'reviewed_text' set to null
      const isReviewed = !texts.some((text) => text.reviewed_text === null);

      reviewStatus[batch] = isReviewed;
    }

    return reviewStatus;
  } catch (error) {
    console.error("Error while checking text review status:", error);
    return {};
  }
}
