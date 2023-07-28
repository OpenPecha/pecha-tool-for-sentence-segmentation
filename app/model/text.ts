import { Status } from "@prisma/client";
import { db } from "~/service/db.server";

export async function getTextToDisplay(userId: string, history: any) {
  if (history) {
    const text = await db.text.findUnique({
      where: { id: parseInt(history) },
    });
    let show =
      JSON.parse(text?.modified_text)?.join("\n") || text?.original_text;
    return {
      ...text,
      id: text?.id,
      original_text: show,
      status: text?.status,
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ignored_list: true,
      rejected_list: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const asignedGroup = user?.assigned_group;
  const ignoredIds = user?.ignored_list.map((item: any) => item.id);
  const rejectedIds = user?.rejected_list.map((item: any) => item.id);
  const text = await db.text.findFirst({
    where: {
      modified_text: null,
      OR: [{ status: null }, { status: "PENDING" }],
      id: {
        notIn: [...(ignoredIds || []), ...(rejectedIds || [])],
      },
      group: {
        in: asignedGroup,
      },
    },
    orderBy: {
      id: "asc",
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
      modified_by: { disconnect: { id: userId } },
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
      modified_text: JSON.stringify(text.split("\n")),
      modified_by_id: userId,
      status: "APPROVED",
      rejected_by: { disconnect: { id: userId } },
    },
  });
}

export async function getUnAsignedGroups() {
  let data = await db.text.findMany({
    select: {
      group: true,
    },
  });
  const uniqueGroups = new Set();

  data.forEach((item) => {
    uniqueGroups.add(item.group);
  });

  let numbers = Array.from(uniqueGroups).sort((a, b) => {
    return a - b;
  });

  const users = await db.user.findMany({
    select: { assigned_group: true },
  });
  const assignedGroups = users.flatMap((user) => user.assigned_group);
  const unassignedNumbers = numbers.filter(
    (number) => !assignedGroups.includes(number)
  );

  return unassignedNumbers;
}

export async function getTextInfo() {
  try {
    let text = await db.text.findMany({
      select: {
        id: true,
        status: true,
      },
    });
    let total = text.length;
    let accepted = text.filter((item) => item.status === "APPROVED").length;
    let rejected = text.filter((item) => item.status === "REJECTED").length;
    let pending = text.filter((item) => item.status === "PENDING").length;

    return { total, accepted, rejected, pending };
  } catch (e) {
    throw new Error(e);
  }
}
