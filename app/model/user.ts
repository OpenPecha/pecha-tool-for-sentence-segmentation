import { db } from "~/service/db.server";

export const createUserIfNotExists = async (username: string) => {
  const existingUser = await db.user.findUnique({
    where: {
      username: username,
    },
    include: {
      text: true,
      ignored_list: true,
      rejected_list: true,
    },
  });

  if (existingUser) {
    return existingUser;
  } else {
    const newUser = await db.user.create({
      data: {
        username: username,
      },
      include: {
        text: true,
      },
    });

    return newUser;
  }
};

export const getUsers = async () => {
  try {
    let user = db.user.findMany({
      include: {
        text: true,
        rejected_list: true,
        ignored_list: true,
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
        text: true,
        rejected_list: true,
        ignored_list: true,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};

export const addGroupToUser = async (group: number, id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = [...user.assigned_group, group];

    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_group: updatedAssignedGroups,
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};

export const removeGroupFromUser = async (group: number, id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error("user not found");
    const updatedAssignedGroups = user.assigned_group.filter(
      (number) => number !== group
    );

    let updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        assigned_group: updatedAssignedGroups,
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
        assigned_group: [],
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};
