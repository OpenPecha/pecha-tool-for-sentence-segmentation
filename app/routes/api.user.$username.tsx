import { LoaderFunction } from "@remix-run/node";
import { getUser } from "~/model/server.user";

export const loader: LoaderFunction = async ({ request, params }) => {
  let username = params.username!;
  return { users: await getUser(username, false) };
};
