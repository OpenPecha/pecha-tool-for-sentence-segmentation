import { ActionFunction, redirect } from "@remix-run/node";
import {
  ignoreText,
  rejectText,
  resetText,
  saveReviewedText,
  saveText,
} from "~/model/text";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  let headerUrl = request.headers.get("referer") as string;
  let url = new URL(headerUrl);
  let session = url.searchParams.get("session");
  let history = url.searchParams.get("history");
  let text = null;

  if (request.method === "POST") {
    const reviewed_text = formData.get("reviewed_text") as string;
    const userId = formData.get("userId") as string;
    const ga_id = formData.get("ga_id") as string;
    const gb_id = formData.get("gb_id") as string;

    text = await saveReviewedText(ga_id, gb_id, reviewed_text, userId);
  }

  if (request.method === "DELETE") {
    const id = formData.get("id") as string;
    text = await resetText(id);
  }
  if (request.method === "PATCH") {
    const id = formData.get("id") as string;
    const userId = formData.get("userId") as string;
    const action = formData.get("_action") as string;
    if (action === "reject") {
      text = await rejectText(id, userId);
    }
    if (action === "ignore") {
      text = await ignoreText(id, userId);
    }
  }
  if (history) {
    return redirect(`/?session=${session}`);
  }
  return text;
};
