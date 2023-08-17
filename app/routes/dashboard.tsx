import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Table from "~/components/Table";
import React from "react";
import { getUser, getUsers } from "~/model/user";
import ReviewerDetail from "~/components/ReviewerDetail";

export const loader: LoaderFunction = async ({ request }) => {
  let users = await getUsers();
  let url = new URL(request.url);
  let session = url.searchParams.get("session") as string;
  if (!session) return redirect("/error");
  let user = await getUser(session);
  if (!user || user.role !== "reviewer") return redirect("/error");
  return { user, users };
};

function dashboard() {
  let { users, user } = useLoaderData();
  let annotators = users.filter((u) => u.role === "annotator");
  return (
    <>
      <Link
        to={"/?session=" + user.username}
        className="w-full bg-yellow-300 p-2"
      >
        back
      </Link>
      <ReviewerDetail user={user} />
      <Table users={annotators} />;
    </>
  );
}

export default dashboard;
