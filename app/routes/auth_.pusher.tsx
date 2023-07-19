import { ActionFunction } from "@remix-run/node";
import Pusher from "pusher";
import { getPusher } from "~/service/pusher.server";

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  const socket_id = formData.get("socket_id") as string;
  const channel_name = formData.get("channel_name") as string;
  const values = Object.fromEntries(formData);
  let username = values.user_id as string;
  let textId = values.text_id as string;
  let presenceData = {
    user_id: textId,
    user_info: {
      username,
    },
  };
  try {
    let { KEY, CLUSTER, APP_ID, SECRET } = process.env;
    let pusher: Pusher = await getPusher(APP_ID!, KEY!, SECRET!, CLUSTER!);
    let auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    return auth;
  } catch (e) {
    console.log("error", e?.message);
  }
  return null;
};
