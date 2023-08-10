import { User } from "@prisma/client";
import { db } from "~/service/db.server";
import {
  batch_text_count,
  get_available_batch_to_review,
  get_not_asigned_batch,
} from "./utils/batch";

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
    if (asignedbatch) {
      // if user is a reviewer, check if there is a batch to review
      // Check if work complete
      const workedBatch = [
        ...(user?.approved_text || []),
        ...(user?.rejected_list || []),
        ...(user?.ignored_list || []),
      ];

      if (
        workedBatch.length === (await batch_text_count(user?.assigned_batch))
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
    if (!asignedbatch) {
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
    }
  } catch (e) {
    console.error("Error in checkAndAssignBatch:", e);
    throw new Error("Unable to assign batch.");
  }
}
export async function checkAndAssignBatchforReview(userSession: User) {
  async function assignNewReviewBatch() {
    let batch = await get_available_batch_to_review(userSession);
    if (batch[0]) {
      await db.user.update({
        where: { username: userSession.username },
        data: {
          assigned_batch_for_review: { push: batch },
        },
      });
      let text = await db.text.findMany({
        where: { batch: { in: batch } },
      });
      let res = text.find((text) => text.modified_text === null);
      return res;
    }
    return null;
  }
  async function assignBatchtoAnnotate() {
    let batch = await get_not_asigned_batch();
    if (batch) {
      await db.user.update({
        where: { username: userSession.username },
        data: {
          assigned_batch: { push: batch },
        },
      });
      return batch;
    }
  }

  let user = await db.user.findUnique({
    where: { username: userSession.username },
    select: {
      assigned_batch: true,
      assigned_batch_for_review: true,
    },
  });
  let batchToAnnotate: string[] = user?.assigned_batch ?? [];
  let batchToReview: string[] = user?.assigned_batch_for_review ?? [];
  // If no unreviewed texts are found, assign new review batch if needed
  if (batchToReview.length === 0) {
    let res = await assignNewReviewBatch();
    if (res) return res;
  }

  // Check if there are unreviewed texts in assigned review batches
  if (batchToReview.length > 0) {
    let batchlist = batchToReview.map((batch) => batch.slice(0, -1) + "a");
    let returnBatch = null;
    const unreviewedTexts = await db.text.findMany({
      where: { batch: { in: batchlist }, reviewed_text: null },
    });
    for (let batch of batchlist) {
      let data = unreviewedTexts.find((text) => text.batch === batch);
      if (data) {
        returnBatch = batch.slice(0, -1) + "c";
        return returnBatch;
      }
    }
    if (!returnBatch || returnBatch.length === 0) {
      returnBatch = await assignNewReviewBatch();
      if (returnBatch) {
        return returnBatch;
      }
    }
  }
  // If no unmodified texts are found, assign new annotation batch if needed
  if (batchToAnnotate.length === 0) {
    let res = await assignBatchtoAnnotate();
    if (res) return res;
  }
  // Check if there are unmodified texts in assigned annotation batches
  if (batchToAnnotate.length > 0) {
    let unmodifiedTexts;
    unmodifiedTexts = await db.text.findMany({
      where: { batch: { in: batchToAnnotate }, reviewed_text: null },
    });
    for (let batch of batchToAnnotate) {
      let data = unmodifiedTexts.find((text) => text.batch === batch);
      if (data) return batch;
    }
    if (!unmodifiedTexts || unmodifiedTexts.length === 0) {
      let batch = await assignBatchtoAnnotate();
      if (batch) return batch;
    }
  }

  return null; // No batch found or needed
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
  //loop through asigned batchs and  get the text list from batch that has both a and b modified;
  //as well not reviewed;
  let batch: string = await checkAndAssignBatchforReview(user!);
  console.log(batch);
  if (!batch) return null;
  if (batch.endsWith("c")) {
    //if the asignedbatch is review batch
    let ga_batch = batch.slice(0, -1) + "a";
    let gb_batch = batch.slice(0, -1) + "b";

    let ga = await db.text.findFirst({
      where: {
        batch: ga_batch,
        reviewed_text: null,
      },
      select: {
        id: true,
        modified_text: true,
        original_text: true,
        order: true,
        modified_by: true,
        batch: true,
      },
      orderBy: { order: "asc" },
    });
    let gb = await db.text.findFirst({
      where: {
        batch: gb_batch,
        reviewed_text: null,
      },
      select: {
        id: true,
        modified_text: true,
        original_text: true,
        order: true,
        modified_by: true,
      },
      orderBy: { order: "asc" },
    });
    if (ga && gb) return { ga, gb, review: true };
  } else {
    const asignedbatch = batch;
    const ignoredIds = user?.ignored_list.map((item: any) => item.id);
    const rejectedIds = user?.rejected_list.map((item: any) => item.id);
    const text = await db.text.findFirst({
      where: {
        modified_by_id: null,
        reviewed_text: { equals: null },
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

export async function saveText(
  id: string,
  text: string,
  userId: string,
  reviewer: boolean
) {
  if (reviewer) {
    let secondId = id.startsWith("a_")
      ? id.replace("a_", "b_")
      : id.replace("b_", "a_");
    const idsToUpdate = [id, secondId];
    const responses = [];

    for (const targetId of idsToUpdate) {
      const response = await db.text.update({
        where: { id: targetId },
        data: {
          modified_text: JSON.stringify(text.split("\n")),
          reviewed_text: JSON.stringify(text.split("\n")),
          status: "APPROVED",
          modified_by_id: userId,
          reviewer_id: userId,
          rejected_by: { set: [] },
          ignored_by: { set: [] },
        },
      });
      responses.push(response);
    }

    return responses;
  }

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
  userId: string,
  a_error_count: string,
  b_error_count: string
) {
  let update_ga = await db.text.updateMany({
    where: {
      id: ga_id,
    },
    data: {
      reviewed_text: JSON.stringify(text.split("\n")),
      status: "APPROVED",
      reviewer_id: userId,
      error_count: a_error_count,
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
      error_count: b_error_count,
    },
  });

  return { update_ga, update_gb };
}
