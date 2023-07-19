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
