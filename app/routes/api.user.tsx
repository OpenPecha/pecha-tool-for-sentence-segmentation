import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  getUsers,
  updateUserAssign,
  updateUserCategory,
  updateUserNickname,
  updateUserReviewer,
} from "~/model/user";

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
  if (action === "change_allow_assign") {
    let updated = await updateUserAssign(id, allow === "true");
    return updated;
  }
  if (action === "change_reviewer") {
    let reviewerId = formdata.get("reviewer_id") as string;
    let updated = await updateUserReviewer(id, reviewerId);
    return updated;
  }
  if (action === "change_categories") {
    let categories = formdata.get("categories") as string;
    let updated = await updateUserCategory(id, categories);
    return updated;
  }
  return null;
};
