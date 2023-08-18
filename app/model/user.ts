import { User } from "@prisma/client";
import { db } from "~/service/db.server";

export const createUserIfNotExists = async (username: string) => {
  let user;
  const existingUser = await db.user.findUnique({
    where: {
      username: username,
    },
    include: {
      approved_text: { orderBy: { id: "asc" } },
      ignored_list: { orderBy: { id: "asc" } },
      rejected_list: { orderBy: { id: "asc" } },
    },
  });

  if (existingUser) {
    user = existingUser;
  } else {
    const newUser = await db.user.create({
      data: {
        username: username,
      },
      include: {
        approved_text: true,
      },
    });

    user = newUser;
  }

  return user;
};

export const getUsers = async (reviewer_id?: string) => {
  let where = reviewer_id
    ? { OR: [{ reviewer_id }, { reviewer_id: null }] }
    : {};
  try {
    let user = db.user.findMany({
      where,
      include: {
        approved_text: true,
        rejected_list: true,
        ignored_list: true,
        reviewed_list: true,
        reviewer: true,
      },
      orderBy: {
        username: "asc", // 'asc' for ascending order, 'desc' for descending order
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};

export const getUser = async (username: string) => {
  try {
    let user = db.user.findUnique({
      where: {
        username,
      },
      include: {
        approved_text: true,
        rejected_list: true,
        ignored_list: true,
        reviewed_list: true,
        reviewer: true,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};

export const addGroupToUser = async (group: string, id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = [...user.assigned_batch, group];

    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_batch: updatedAssignedGroups,
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};

export const assignReview = async (group: string, id: string) => {
  if (!group) throw new Error("group is required");
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = [...user.assigned_batch_for_review, group];
    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_batch_for_review: updatedAssignedGroups,
      },
    });
    console.log(updatedUser);
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};

export const removeGroupFromUser = async (group: string, id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = user.assigned_batch.filter(
      (number) => number !== group
    );

    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_batch: updatedAssignedGroups,
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};
export const removeAsignedReview = async (group: string, id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = user.assigned_batch_for_review.filter(
      (number) => number !== group
    );

    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_batch_for_review: updatedAssignedGroups,
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};
export const removeAllGroupFromUser = async () => {
  try {
    const updatedUser = await db.user.updateMany({
      data: {
        assigned_batch: [],
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};
export const changeUserGroup = async (group: Group, id: string) => {
  try {
    let updateUserGroup = await db.user.update({
      where: {
        id,
      },
      data: {
        group,
      },
    });
    return updateUserGroup;
  } catch (e) {
    throw new Error("cannot change user group" + e);
  }
};

export const updateUserNickname = async (id: string, name: string) => {
  try {
    let user = await db.user.update({
      where: {
        id,
      },
      data: {
        nickname: name,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};
export const updateUserAssign = async (id: string, allow: boolean) => {
  try {
    let user = await db.user.update({
      where: {
        id,
      },
      data: {
        allow_annotation: allow,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};

export const getReviewerList = async () => {
  try {
    let reviewers = await db.user.findMany({
      where: {
        role: "reviewer",
      },
      include: {
        approved_text: true,
        rejected_list: true,
        ignored_list: true,
        reviewed_list: true,
        annotator_list: true,
      },
      orderBy: {
        username: "asc", // 'asc' for ascending order, 'desc' for descending order
      },
    });
    return reviewers;
  } catch (e) {
    throw new Error(e);
  }
};

export function updateUserReviewer(id: string, reviewerId: string) {
  return db.user.update({
    where: {
      id,
    },
    data: {
      reviewer_id: reviewerId,
    },
  });
}

export function updateUserCategory(id: string, categories: string) {
  let data = JSON.parse(categories);
  return db.user.update({
    where: { id },
    data: {
      categories: data,
    },
  });
}
