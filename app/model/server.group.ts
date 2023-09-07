import { db } from "~/service/db.server";

export const getAllUniqueBatches = async (category: string[]) => {
  try {
    const texts = await db.text.findMany({
      where: {
        category: { in: category },
      },
      select: {
        batch: true,
      },
      orderBy: {
        batch: "asc",
      },
    });

    // Extracting the batch numbers
    const batches = texts.map((text) => text.batch);

    // Getting unique batch numbers
    const uniqueBatches = [...new Set(batches)];
    return uniqueBatches;
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
    });

    // Extracting the assigned batches
    const allBatches = users.flatMap((user) => user.assigned_batch);

    // Getting unique batch numbers
    const uniqueAssignedBatches = [...new Set(allBatches)];

    return uniqueAssignedBatches;
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
    const unassignedBatches = allBatches
      .filter((batch) => !assignedBatches.includes(batch))
      .sort((a, b) => parseInt(a) - parseInt(b));

    return unassignedBatches[0];
  } catch (error) {
    console.error(
      "An error occurred while fetching unassigned batches:",
      error
    );
    throw error;
  }
};

export const getUniqueTextsGroup = async () => {
  const textRecords = await db.text.findMany({
    select: {
      version: true,
    },
  });
  const uniqueVersions = Array.from(
    new Set(textRecords.map((record) => record.version))
  );

  const uniqueVersionCategories = [];
  for (const version of uniqueVersions) {
    const recordsWithVersion = await db.text.findMany({
      where: {
        version: version,
      },
      select: {
        category: true,
      },
    });

    // Assuming each version has the same category in all its records,
    // you can pick the category from the first record
    if (recordsWithVersion.length > 0) {
      const category = recordsWithVersion[0].category;
      uniqueVersionCategories.push({ version, category });
    }
  }
  return uniqueVersionCategories;
};
