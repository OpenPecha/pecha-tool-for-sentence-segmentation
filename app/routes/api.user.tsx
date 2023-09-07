import { Role } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  getUsers,
  updateUserNickname,
  updateUserAssign,
  updateUserCategory,
  updateUserReviewer,
  updateUserRole,
} from "~/model/server.user";

export const loader: LoaderFunction = async ({ request }) => {
  return { users: await getUsers() };
};
export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  let nickname = formdata.get("nickname") as string;
  let id = formdata.get("id") as string;
  let allow = formdata.get("allow") as string;
  let action = formdata.get("action") as string;
  if (action === "change_nickname") {
    let updated = await updateUserNickname(id, nickname);
    return updated;
  }
  if (action === "change_categories") {
    let category = formdata.get("category") as string;
    let updated = await updateUserCategory(id, category);
    return updated;
  }
  if (action === "change_allow_assign") {
    let updated = await updateUserAssign(id, allow === "true");
    return updated;
  }
  if (action === "change_reviewer") {
    let reviewer_name = formdata.get("reviewer") as string;
    let updated = await updateUserReviewer(id, reviewer_name);
    return updated;
  }
  if (action === "change_role") {
    let role = formdata.get("role") as Role;
    let updated = await updateUserRole(id, role);
    return updated;
  }
  return null;
};
