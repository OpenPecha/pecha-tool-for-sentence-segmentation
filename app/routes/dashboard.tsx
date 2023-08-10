import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Table from "~/components/Table";
import React from "react";
import { getUsers } from "~/model/user";

export const loader: LoaderFunction = async ({ request }) => {
  let user = await getUsers();

  return { user };
};

function dashboard() {
  let { user } = useLoaderData();
  return <Table user={user} />;
}

export default dashboard;
