import { LoaderFunction, redirect } from "@remix-run/node";
import React, { useState } from "react";
import { getUser } from "~/model/user.server";
import { getNumberOfReviewedTask, getNumberOfTask, getUsersList } from "./data";
import { Outlet, useLoaderData, useMatches } from "@remix-run/react";
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
  let matches = useMatches();
  let isUserSelected = matches.find((p) => p.params?.username);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header />
        <main>
          <div className="flex gap-2  mt-5 ">
            <UserListCard />
            <div className="flex flex-col w-full">
              <TopInfo />
              {isUserSelected ? (
                <Outlet />
              ) : (
                <div className="flex justify-center text-lg ">
                  user not selected
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default owner;
