import { LoaderFunction, redirect } from "@remix-run/node";
import React, { useState } from "react";
import { getUser } from "~/model/user.server";
import { getNumberOfReviewedTask, getNumberOfTask, getUsersList } from "./data";
import { Outlet, useLoaderData } from "@remix-run/react";
import Header from "./Component/Header";
import TopInfo from "./Component/TopInfo";
import UserListCard from "./Component/UsersListCard";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user = await getUser(session, true);
  if (!user) redirect("/");
  if (user?.role !== "OWNER") redirect("/?session=" + user?.username);

  let users = await getUsersList();
  let numberOfTask = await getNumberOfTask(null);
  let numberOfReviewedTask = await getNumberOfReviewedTask(null);

  return { user, users, numberOfTask, numberOfReviewedTask };
};

function owner() {
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header />
        <main>
          <TopInfo />
          <div className="flex gap-2 mx-10 mt-5">
            <UserListCard />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default owner;
