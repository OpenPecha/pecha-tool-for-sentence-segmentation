import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import Table from "~/components/Table";
import React from "react";
import { getReviewerList, getUser, getUsers } from "~/model/user";
import ReviewerDetail from "~/components/ReviewerDetail";
import { getCategories, getCategoriesByReviewer } from "~/model/utils/category";
import { MdArrowBack } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
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
  const revalidator = useRevalidator();

  return (
    <>
      <div className="flex justify-between items-center bg-gray-400 shadow-sm">
        <Link
          to={"/?session=" + user.username}
          className="text-white bg-gray-500 p-2 w-10"
        >
          <MdArrowBack />
        </Link>
        <h2>Reviewer Dashboard</h2>
        <button
          onClick={() => revalidator.revalidate()}
          disabled={revalidator.state !== "idle"}
          className="text-white bg-gray-500 p-2 w-10"
        >
          <FiRefreshCw />
        </button>
      </div>
      <ReviewerDetail user={user} />
      <Table users={annotators} />;
    </>
  );
}

export default dashboard;
