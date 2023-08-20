import { User } from "@prisma/client";
import { db } from "~/service/db.server";

//sort by category list
export function batchSort(a: string, b: string) {
  const numA = parseInt(a.match(/\d+/)[0]);
  const numB = parseInt(b.match(/\d+/)[0]);

  if (numA !== numB) {
    return numA - numB;
  } else {
    const lastCharA = a.charAt(a.length - 1);
    const lastCharB = b.charAt(b.length - 1);
    return lastCharA.localeCompare(lastCharB);
  }
}

//count batch length
export async function batch_text_count(batch: string[]) {
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

//get all batch  (assigned and unassigned)
export async function unique_batch_list() {
  const allBatches = await db.text.findMany({
    select: { batch: true },
  });
  const uniqueBatches = new Set(allBatches.map((item) => item.batch));
  return Array.from(uniqueBatches).sort(batchSort);
}
export async function get_all_batch() {
  const data = await db.text.findMany({
    select: {
      batch: true,
      modified_text: true,
    },
  });

  // Create a Set to store unique batch numbers and sort them
  const uniqueBatches = new Set(data.map((item) => item.batch));
  const sortedNumbers = Array.from(uniqueBatches).sort(batchSort);

  // Get assigned batches from the user table
  const user_assignedBatches = await db.user.findMany({
    select: { assigned_batch: true },
  });
  const assigned_batch = Array.from(
    new Set(user_assignedBatches.flatMap((user) => user.assigned_batch))
  );
  // Separate unassigned numbers
  let unassigned_batchs = sortedNumbers.filter(
    (number) => !assigned_batch.includes(number)
  );

  //get batch assigned to reviewer
  let reviewer = await db.user.findMany({
    where: { role: "reviewer" },
    select: { assigned_batch: true },
  });
  let reviewer_batch = Array.from(
    new Set(reviewer.flatMap((user) => user.assigned_batch))
  );
  unassigned_batchs = unassigned_batchs.filter((item) => {
    let second = item?.endsWith("a")
      ? item?.slice(0, -1) + "b"
      : item?.slice(0, -1) + "a";
    return !reviewer_batch.includes(item) && !reviewer_batch.includes(second);
  });
  // Return the two groups
  return {
    unassigned: unassigned_batchs,
    assigned: assigned_batch,
  };
}

//for annotator

export async function get_not_asigned_batch(
  batch?: string[],
  reviewer?: boolean,
  categories?: string[]
) {
  let { unassigned } = await get_all_batch();
  if (categories.length === 0)
    throw new Error("Please select at least one category");
  if (batch && batch?.length > 0) {
    let batchFormat = batch?.map((p) => p.slice(0, -1));
    unassigned = unassigned.filter((item: string) => {
      let data = item.slice(0, -1);
      return !batchFormat?.includes(data);
    });
  }
  if (reviewer) {
    unassigned = unassigned.filter((propertyName) => {
      let second = propertyName?.endsWith("a")
        ? propertyName?.slice(0, -1) + "b"
        : propertyName?.slice(0, -1) + "a";
      //if propertyName and second both exist in array return it
      return unassigned.includes(propertyName) && unassigned.includes(second);
    });
  }
  if (categories) {
    unassigned = unassigned.filter((element1) => {
      return categories.some((element2) => element1.startsWith(element2));
    });
  }
  console.log(unassigned);
  return unassigned[0] || "";
}

//get batch list to review
export async function get_batch_assigned_to_review() {
  const assignedBatchesForReview = await db.user.findMany({
    select: { assigned_batch_for_review: true },
  });
  const assignedBatchesForReviewUnique = new Set(
    assignedBatchesForReview.flatMap((item) => item.assigned_batch_for_review)
  );
  return Array.from(assignedBatchesForReviewUnique);
}

export async function get_available_batch_to_review(userSession: User) {
  let reviewer_id = userSession.id;
  try {
    let text_1 = await db.text.findFirst({
      where: {
        id: { startsWith: "a_" },
        modified_text: { not: null },
        reviewed_text: null,
      },
      orderBy: {
        id: "asc",
      },
      select: { id: true, batch: true, modified_by: true },
    });
    let text_2 = await db.text.findFirst({
      where: {
        id: text_1?.id.replace("a_", "b_"),
        modified_text: { not: null },
        reviewed_text: null,
      },
      select: { batch: true, modified_by: true },
    });
    if (
      text_1 &&
      text_2 &&
      text_1?.modified_by?.reviewer_id === reviewer_id &&
      text_2?.modified_by?.reviewer_id === reviewer_id
    ) {
      return text_1.batch?.slice(0, -1) + "c";
    }
  } catch (error) {
    console.error(
      "An error occurred while getting available batches to review:",
      error
    );
    return [];
  }
}

export async function get_batchList_not_reviewed() {
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

export async function get_batchList_reviewed() {
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

export async function getCountOfbatchforreview(batch: string[]) {
  const uniquebatchs = new Set();
  batch.forEach((item) => {
    uniquebatchs.add(item.slice(0, -1) + "a");
    uniquebatchs.add(item.slice(0, -1) + "b");
  });
  let batches_numbers: string[] = Array.from(uniquebatchs);
  try {
    const data = await db.text.findMany({
      where: {
        batch: { in: batches_numbers },
      },
    });
    console.log(data.length);
    return data.length;
  } catch (e) {
    console.log(e);
    return 0;
  }
}
