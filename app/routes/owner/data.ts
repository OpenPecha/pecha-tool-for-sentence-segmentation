import { db } from "~/service/db.server";

export function getUsersList() {
  return db.user.findMany({
    where: { OR: [{ role: "REVIEWER" }, { role: "ANNOTATOR" }] },
    include: {
      text: {
        where: {
          reviewed: { not: true },
          original_text: { not: "" },
          modified_on: { not: null },
        },
        select: { modified_on: true },
      },
    },
  });
}

export async function getNumberOfTask(
  username: string | null,
  startDate: string | Date,
  endDate: string | Date
) {
  if (!username) {
    let total = await db.text.count();
    let reviewed = await getNumberOfReviewedTask(null);

    return Promise.resolve({ total, reviewed });
  }

  // Convert dates to Date objects if they are strings
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Create a where clause for the date range
  const dateWhere =
    startDate && endDate
      ? startDate !== endDate
        ? { gte: start, lte: end }
        : start
      : undefined;

  // Count total texts
  const totalTextsPromise = db.text.count({
    where: {
      modified_by: { username },
      modified_on: dateWhere,
    },
  });

  // Count reviewed texts
  const reviewedTextsPromise = db.text.count({
    where: {
      modified_by: { username },
      modified_on: dateWhere,
      reviewed: true,
    },
  });

  return Promise.all([totalTextsPromise, reviewedTextsPromise])
    .then(([total, reviewed]) => {
      return { total, reviewed };
    })
    .catch((error) => {
      console.error("Error fetching task counts:", error);
      return { total: 0, reviewed: 0 };
    });
}

export function getNumberOfReviewedTask(username: string | null) {
  if (username)
    return db.text.count({
      where: {
        modified_by: { username },
        reviewed: true,
      },
    });
  return db.text.count({
    where: {
      reviewed: true,
    },
  });
}
export const getUser = async (username: string) => {
  try {
    let user = db.user.findUnique({
      where: {
        username,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};
export async function getTaskOfUser(
  username: string | null,
  take: number,
  skip: number,
  startDate: string | Date,
  endDate: string | Date
) {
  if (username) {
    return await db.text.findMany({
      select: {
        id: true,
        original_text: true,
        modified_on: true,
        reviewed: true,
        word_count: true,
      },
      where: {
        modified_by: { username },
        modified_on:
          startDate && endDate
            ? startDate !== endDate
              ? { gte: new Date(startDate), lte: new Date(endDate) }
              : new Date(startDate)
            : undefined,
      },
      take,
      skip,
      orderBy: {
        reviewed: "asc",
      },
    });
  }
}
export function getTask(taskId) {
  return db.text.findUnique({
    where: {
      id: parseInt(taskId),
    },
  });
}

export function getTotalWordCount(
  username: string,
  startDate: string | Date,
  endDate: string | Date
) {
  return db.text.aggregate({
    _sum: {
      word_count: true,
    },
    where: {
      modified_by: { username },
      modified_on:
        startDate && endDate
          ? startDate !== endDate
            ? { gte: new Date(startDate), lte: new Date(endDate) }
            : new Date(startDate)
          : undefined,
    },
  });
}
