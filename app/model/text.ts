import { Status } from "@prisma/client";
import { db } from "~/service/db.server";

export async function getTextToDisplay(
  activeText: any = [],
  userId: string,
  history: any
) {
  if (history) {
    const text = await db.text.findUnique({
      where: { id: parseInt(history) },
    });
    let show = text?.modified_text || text?.original_text;
    return {
      ...text,
      id: text?.id,
      original_text: show,
      status: text?.status,
    };
  }

  const excludedIds = activeText?.map((item) => parseInt(item.id));
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ignored_list: true,
      rejected_list: true,
    },
  });
  const ignoredIds = user?.ignored_list.map((item: any) => item.id);
  const rejectedIds = user?.rejected_list.map((item: any) => item.id);
  let text = await db.text.findFirst({
    where: {
      NOT: {
        id: {
          in: excludedIds,
        },
      },
      modified_text: null,
      OR: [{ status: null }, { status: "PENDING" }],
      id: {
        notIn: [...(ignoredIds || []), ...(rejectedIds || [])],
      },
    },
  });
  if (!text) return null;
  return text;
}

export function getTextToDisplayByUser(userid: string) {
  let allTextByUser = db.text.findMany({
    where: {
      modified_by_id: userid,
    },
    select: {
      id: true,
      status: true,
      modified_text: true,
    },
  });
  return allTextByUser;
}

export function resetText(id: number) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: null,
      modified_by_id: null,
      status: "PENDING",
    },
  });
}

export async function rejectText(id: number, userId: string) {
  let text = await db.text.update({
    where: {
      id,
    },
    data: {
      status: "PENDING",
      modified_by: { disconnect: { id: userId } },
      rejected_by: { connect: { id: userId } },
    },
  });
  return text;
}
export async function removeRejectText(
  id: number,
  userId: string,
  status: Status
) {
  let text = db.text.update({
    where: {
      id,
    },
    data: {
      status,
      rejected_by: { disconnect: { id: userId } },
    },
  });
  let user = db.user.update({
    where: {
      id: userId,
    },
    data: {
      text: {
        connect: { id },
      },
    },
  });
  return text;
}

export async function ignoreText(id: number, userId: string) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      ignored_by: { connect: { id: userId } },
      status: "PENDING",
    },
  });
}
export function saveText(id: number, text: string, userId: string) {
  return db.text.update({
    where: {
      id,
    },
    data: {
      modified_text: text,
      modified_by_id: userId,
      status: "APPROVED",
    },
  });
}
