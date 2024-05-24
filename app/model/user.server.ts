import { Role, User } from "@prisma/client";
import { db } from "~/service/db.server";

export const updatePicture = async (user: User) => {
  if (!user.picture) {
    //get user detail from api
    let api = "https://pecha.tools/api/user/?email=" + user.username;
    let response = await fetch(api);
    let data = await response.json();

    return await db.user.update({
      where: { username: user.username },
      data: {
        picture: data?.picture || null,
      },
    });
  }
  return user;
};

export const createUserIfNotExists = async (username: string, detail: any) => {
  const existingUser = detail
    ? await db.user.findUnique({
        where: {
          username: username,
        },
        include: {
          text: {
            where: {
              AND: {
                modified_text: { not: { equals: null } },
              },
            },
            select: { id: true, reviewed: true, status: true },
            orderBy: { updatedAt: "desc" },
          },
          rejected_list: { select: { id: true, reviewed: true, status: true } },
        },
      })
    : await db.user.findUnique({
        where: {
          username: username,
        },
      });

  if (existingUser) {
    try {
      await updatePicture(existingUser);
      return existingUser;
    } catch (e) {
      return existingUser;
    }
  }
  const newUser = await db.user.create({
    data: {
      username: username,
      nickname: username?.split("@")[0] || "user",
      role: "USER",
    },
    include: {
      text: true,
    },
  });
  await updatePicture(newUser);
  return newUser;
};

export const getUsers = async () => {
  try {
    let users = await db.user.findMany({
      include: {
        text: { select: { id: true, status: true, reviewed: true } },
        rejected_list: true,
        ignored_list: true,
        reviewer: true,
      },
    });
    return users;
  } catch (e) {
    throw new Error(e);
  }
};

export const getUser = async (username: string, min: boolean) => {
  let include = min
    ? {
        text: { select: { id: true, reviewed: true } },
        rejected_list: { select: { id: true } },
      }
    : {
        text: { where: { NOT: { modified_text: null } } },
        rejected_list: true,
      };

  try {
    let user = db.user.findUnique({
      where: {
        username,
      },
      include: include,
    });
    return user;
  } catch (e) {
    throw new Error(e);
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

export async function updateUserCategory(id: string, category: string) {
  return db.user.update({
    where: { id },
    data: {
      categories: { set: JSON.parse(category) },
    },
  });
}

export const updateUserAssign = async (id: string, allow: boolean) => {
  try {
    let user = await db.user.update({
      where: {
        id,
      },
      data: {
        allow_assign: allow,
      },
    });
    return user;
  } catch (e) {
    throw new Error(e);
  }
};
export const updateUserReviewer = async (
  id: string,
  reviewer_name: string | null
) => {
  if (reviewer_name === null || reviewer_name === "") {
    let updatedUser = await db.user.update({
      where: { id },
      data: { reviewer_id: null },
    });
    return updatedUser;
  }
  try {
    let updatedUser = await db.user.update({
      where: { id },
      data: {
        reviewer: {
          connect: { username: reviewer_name },
        },
      },
    });
    return updatedUser;
  } catch (e) {
    throw new Error(e);
  }
};
export const removeBatchFromUser = async (batch: number, id: string) => {
  //check if all text inside batch is either ignored by user or reviewed;

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: { ignored_list: true },
    });
    let isAllIgnored = await areAllTextsIgnoredOrReviewed(id, batch);
    if (!user) throw new Error("user not found");
    if (isAllIgnored) {
      const updatedAssignedBatchs = user.assigned_batch.filter(
        (number) => number !== batch
      );

      let updatedUser = await db.user.update({
        where: {
          id,
        },
        data: {
          assigned_batch: updatedAssignedBatchs,
        },
      });
      return updatedUser;
    }
    return null;
  } catch (e) {
    throw new Error("cannot add group" + e);
  }
};

async function areAllTextsIgnoredOrReviewed(userId: string, batchId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ignored_list: { where: { batch: batchId } },
      text: { where: { batch: batchId } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  let approved_count = user.text.length;
  let reviewed_count = user.text.filter((l) => l.reviewed).length;
  if (approved_count === reviewed_count) return true;
  const ignoredTexts = await db.text.findMany({
    where: {
      batch: batchId,
      ignored_by: { some: { username: { equals: user.username } } },
    },
    include: {
      ignored_by: true,
    },
  });

  const ignoredTextIds = ignoredTexts.map((text) => text.id);

  const remainingTexts = await db.text.findMany({
    where: {
      batch: batchId,
      NOT: {
        id: { in: ignoredTextIds },
      },
    },
  });

  // Check if all texts in the batch are either ignored or reviewed
  const allIgnoredOrReviewed = remainingTexts.every((text) => {
    return text.reviewed === true;
  });

  return allIgnoredOrReviewed;
}

export async function remainingTextToApproved(userId: string) {
  let remains = await db.user.findUnique({
    where: { id: userId },
    select: { assigned_batch: true },
  });
  let lastbatch = remains?.assigned_batch.at(-1);
  let text = await db.text.findMany({
    where: {
      batch: lastbatch,
    },
    select: { id: true, status: true, reviewed: true },
  });
  let remaining_count = text.filter((t) => t.status !== "APPROVED").length;
  let not_reviewed_count = text.filter((t) => t.reviewed === false).length;

  return { remaining_count, not_reviewed_count };
}

export async function getUserById(id: string | null) {
  if (id === null) return null;
  let item = await db.user.findUnique({
    where: { id },
  });
  return item;
}
export async function updateUserRole(id: string, role: Role) {
  let item = await db.user.update({
    where: { id },
    data: { role },
  });
  return item;
}
