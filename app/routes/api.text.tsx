import { ActionFunction, redirect } from "@remix-run/node";
import { ignoreText, rejectText, resetText, saveText } from "~/model/text";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  let headerUrl = request.headers.get("referer") as string;
  let url = new URL(headerUrl);
  let session = url.searchParams.get("session");
  let history = url.searchParams.get("history");
  let text = null;

  if (request.method === "POST") {
    const modified_text = formData.get("modified_text") as string;
    const userId = formData.get("userId") as string;
    const id = formData.get("id") as string;
    const reviewer = formData.get("reviewer") as string;
    text = await saveText(id, modified_text, userId, !!reviewer);
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
