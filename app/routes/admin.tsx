import { useState } from "react";
import Header from "~/components/admin/Header";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import Sidebar from "~/components/admin/Sidebar";
import {
  ActionFunction,
  LoaderFunction,
  defer,
  json,
  redirect,
} from "@remix-run/node";
import { getUser } from "~/model/user.server";
import { getProgress } from "~/model/text.server";
import { db } from "~/service/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user = await getUser(session, true);

  let activeWork = await db.system.findFirst();
  if (user?.role === "ADMIN" || user?.role === "REVIEWER") {
    let progress = await getProgress();
    return json({
      user,
      progress,
      activeWork,
    });
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  let currentStatus = formdata.get("currentStatus") as string;
  let statusId = formdata.get("statusId") as string;

  return await db.system.update({
    where: { id: statusId },
    data: {
      status: currentStatus === "Activated" ? "Paused" : "Activated",
    },
  });
};

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, activeWork } = useLoaderData();
  let changeStatus = useFetcher();
  function handleActiveWork() {
    changeStatus.submit(
      {
        statusId: activeWork?.id,
        currentStatus: activeWork?.status,
      },
      {
        method: "POST",
      }
    );
  }
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <button
            style={{
              marginTop: 20,
              background: activeWork.status === "Activated" ? "green" : "blue",
              color: "white",
              opacity: changeStatus.state !== "idle" ? "0.4" : "1",
            }}
            className="font-bold"
            onClick={handleActiveWork}
          >
            {activeWork.status === "Activated" ? (
              <> Activated Review (all work are blocked from annotators)</>
            ) : (
              <> Activated Annotate (annotators can now continue working)</>
            )}
          </button>
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
