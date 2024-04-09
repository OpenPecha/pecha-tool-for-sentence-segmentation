import { db } from "~/service/db.server";

export const getAllUniqueBatches = async (category: string[]) => {
  try {
    const texts = await db.text.groupBy({
      by: ["batch"],
      where: {
        category: { in: category },
      },
      orderBy: {
        batch: "asc",
      },
    });
    const batches = texts.map((text) => text.batch);
    return batches;
  } catch (error) {
    console.error("An error occurred while fetching unique batches:", error);
    throw error;
  }
};

export const getAllAssignedBatches = async () => {
  try {
    const users = await db.user.findMany({
      select: {
        assigned_batch: true,
      },
      distinct: ["assigned_batch"],
      orderBy: { id: "asc" },
    });

    // Extracting the assigned batches
    const allBatches = users.flatMap((user) => user.assigned_batch);

    // Getting unique batch numbers
    return allBatches;
  } catch (error) {
    console.error("An error occurred while fetching assigned batches:", error);
    throw error;
  }
};

export const getUnassignedBatch = async (category: string[]) => {
  try {
    const allBatches = await getAllUniqueBatches(category);
    const assignedBatches = await getAllAssignedBatches();

    // Finding the batches that are not assigned
    const unassignedBatches = allBatches.filter(
      (batch) => !assignedBatches.includes(batch)
    );

    return unassignedBatches[0];
  } catch (error) {
    console.error(
      "An error occurred while fetching unassigned batches:",
      error
    );
    throw error;
  }
};

export const getGroupInfo = async (version: string) => {
  const textRecords = await db.text.findMany({
    where: {
      version: version,
    },
    select: {
      version: true,
      category: true, // Include category in the query
      reviewed: true,
      modified_text: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  let reviewed_count =
    textRecords.filter((item) => item.reviewed === true).length ?? 0;

  let accepted_count =
    textRecords.filter((item) => item.modified_text !== null).length ?? 0;
  return {
    total: textRecords.length,
    reviewed: reviewed_count,
    accepted_count,
  };
};