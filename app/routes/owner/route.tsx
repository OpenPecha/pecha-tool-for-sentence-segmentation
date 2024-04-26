import { LinksFunction, LoaderFunction, redirect } from "@remix-run/node";
import React, { useMemo } from "react";
import { getUser } from "~/model/user.server";
import { getNumberOfReviewedTask, getNumberOfTask, getUsersList } from "./data";
import {
  Outlet,
  useFetchers,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import Header from "./Component/Header";
import TopInfo from "./Component/TopInfo";
import UserListCard from "./Component/UsersListCard";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";
import { useNavigation } from "@remix-run/react";

export let links: LinksFunction = () => {
  // if you already have one only add this stylesheet to your list of links
  return [{ rel: "stylesheet", href: nProgressStyles }];
};

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
  let transition = useNavigation();

  let fetchers = useFetchers();

  /**
   * This gets the state of every fetcher active on the app and combine it with
   * the state of the global transition (Link and Form), then use them to
   * determine if the app is idle or if it's loading.
   * Here we consider both loading and submitting as loading.
   */
  let state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      let states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers]
  );

  React.useEffect(() => {
    // and when it's something else it means it's either submitting a form or
    // waiting for the loaders of the next location so we start it
    if (state === "loading") NProgress.start();
    // when the state is idle then we can to complete the progress bar
    if (state === "idle") NProgress.done();
  }, [transition.state]);

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
