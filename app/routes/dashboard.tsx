import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Table from "~/components/Table";
import React from "react";
import { getReviewerList, getUser, getUsers } from "~/model/user";
import ReviewerDetail from "~/components/ReviewerDetail";
import { getCategories, getCategoriesByReviewer } from "~/model/utils/category";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session") as string;
  if (!session) return redirect("/error");
  let user = await getUser(session);
  let users = await getUsers(user.id);
  let reviewers = await getReviewerList();
  let categories = await getCategoriesByReviewer(user.id);
  if (!user || user.role !== "reviewer") return redirect("/error");
  return { user, users, reviewers, categories };
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
        {"<-"} back
      </Link>
      <ReviewerDetail user={user} />
      <Table users={annotators} />;
    </>
  );
}

export default dashboard;
