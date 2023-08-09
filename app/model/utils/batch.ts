import { db } from "~/service/db.server";

//sort by category list
export function batchSort(a: string, b: string) {
  let category = a.split("_")[0];
  let sliced_a = a.slice(0, -1).replace(`${category}_`, "");
  let sliced_b = b.slice(0, -1).replace(`${category}_`, "");
  return sliced_a - sliced_b;
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
  return uniqueBatches;
}
export async function get_all_batch() {
  const data = await db.text.findMany({
    select: {
      batch: true,
    },
  });

  // Create a Set to store unique batch numbers and sort them
  const uniqueBatches = new Set(data.map((item) => item.batch));
  const sortedNumbers = Array.from(uniqueBatches).sort(batchSort);

  // Get assigned batches from the user table
  const assignedBatches = await db.user.findMany({
    select: { assigned_batch: true },
  });
  const assignedNumbers = assignedBatches.flatMap(
    (user) => user.assigned_batch
  );

  // Separate unassigned numbers
  const unassignedNumbers = sortedNumbers.filter(
    (number) => !assignedNumbers.includes(number)
  );

  // Return the two groups
  return {
    unassigned: unassignedNumbers,
    assigned: assignedNumbers,
  };
}

//for annotator

export async function get_not_asigned_batch(batch?: string[]) {
  let { unassigned } = await get_all_batch();
  let batchFromReviewer = await getListasignedBatchreviewer();
  let batchFormat = batch?.map((p) => p.slice(0, -1));
  let batchFormat2 = batchFromReviewer?.map((p) => p.slice(0, -1));

  if (batch?.length) {
    unassigned = unassigned.filter((item: string) => {
      let data = item.slice(0, -1);
      return !batchFormat?.includes(data) && !batchFormat2?.includes(data);
    });
  }
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
  return assignedBatchesForReviewUnique;
}
async function check_a_b(unassignedBatches: string[]) {
  let validBatches = [];

  for (let i = 0; i < unassignedBatches.length; i += 2) {
    if (i + 1 < unassignedBatches.length) {
      const batchA = unassignedBatches[i];
      const batchB = unassignedBatches[i + 1];

      const [resultA, resultB] = await Promise.all([
        db.text.findMany({
          where: {
            batch: batchA,
            modified_text: { not: null },
          },
        }),
        db.text.findMany({
          where: {
            batch: batchB,
            modified_text: { not: null },
          },
        }),
      ]);

      // Only add the "c" batch if both "a" and "b" batches exist and have modified_text not null
      if (resultA.length > 0 && resultB.length > 0) {
        const batchC = batchA.slice(0, -1) + "c";
        validBatches.push(batchC);
      }
    }
  }
  let allBatchesForReviewAssigned = await db.user.findMany({
    select: { assigned_batch_for_review: true },
  });
  let allBatchesForReviewAssignedUnique = new Set(
    allBatchesForReviewAssigned.flatMap(
      (item) => item.assigned_batch_for_review
    )
  );
  const resultBatches = validBatches.filter(
    (batch) => !allBatchesForReviewAssignedUnique.has(batch)
  );
  return resultBatches;
}
export async function get_available_batch_to_review() {
  // Get a unique list of all batch identifiers
  const uniqueBatches = await unique_batch_list();
  const assignedBatchesForReviewUnique = await get_batch_assigned_to_review();
  let availableBatches = [];

  const texts = await db.text.findMany({
    where: {
      batch: { in: Array.from(uniqueBatches) },
      reviewer_id: null, // Only consider texts that have not been reviewed yet
    },
  });
  for (const batch of uniqueBatches) {
    // Find all text entries with the current batch identifier
    if (assignedBatchesForReviewUnique.has(batch)) continue;
    texts.filter((item) => item.batch === batch);
    // Check if all texts have modified_text not null
    if (texts.every((text) => text.modified_text !== null)) {
      availableBatches.push(batch);
    }
  }
  const filteredBatches = await check_a_b(availableBatches);
  console.log(filteredBatches);
  return filteredBatches[0];
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

export async function getListasignedBatchreviewer() {
  const data = await db.user.findMany({
    where: {
      role: "reviewer",
    },
    select: {
      assigned_batch: true,
    },
  });
  let result = data.map((item) => item.assigned_batch).flat();
  return result;
}
