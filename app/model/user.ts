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
