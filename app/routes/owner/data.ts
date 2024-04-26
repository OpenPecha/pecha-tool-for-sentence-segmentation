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

export function getNumberOfTask(username: string | null) {
  if (username) return db.text.count({ where: { modified_by: { username } } });
  return db.text.count();
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
