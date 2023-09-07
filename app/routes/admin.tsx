import { useState } from "react";
import Header from "~/components/admin/Header";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import Sidebar from "~/components/admin/Sidebar";
import { LoaderFunction, defer, json, redirect } from "@remix-run/node";
import { getUser } from "~/model/server.user";
import { getProgress } from "~/model/server.text";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user = await getUser(session, true);
  let progress = await getProgress();
  return json({
    user,
    progress,
  });
};

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useLoaderData();
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div
              className={`mx-auto max-w-screen-2xl  ${
                pathname.includes("metabase") ? "p-0" : " p-4 md:p-6 2xl:p-10"
              }`}
            >
              <Outlet context={user} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
