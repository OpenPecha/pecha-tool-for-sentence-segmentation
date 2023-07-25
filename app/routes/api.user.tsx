import { LoaderFunction } from "@remix-run/node";
import { getUsers } from "~/model/user";

export const loader: LoaderFunction = async ({ request }) => {
  return { users: await getUsers() };
};
