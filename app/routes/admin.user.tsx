import { LoaderFunction, json, redirect } from "@remix-run/node";
import UserListCard from "~/components/admin/UserListCard";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { toolname } from "~/const";
import { db } from "~/service/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  const admin = await db.user.findUnique({
    where: { username: session },
    select: {
      id: true,
      nickname: true,
      username: true,
      role: true,
      picture: true,
    },
  });
  const users = await db.user.findMany({
    where: { reviewer_id: { not: null } },
    select: {
      assigned_batch: true,
      id: true,
      nickname: true,
      username: true,
      role: true,
      picture: true,
      reviewer_id: true,
      text: {
        where: {
          reviewed: { not: true },
          original_text: { not: "" },
          modified_on: { not: null },
        },
        select: { modified_on: true },
      },
    },
  });
  let sorted_user = users.map((user) => {
    return {
      username: user?.username,
      nickname: user?.nickname,
      role: user?.role,
      picture: user?.picture,
      text: user?.text.length,
      reviewer_id: user?.reviewer_id,
      modified_on: user?.text?.find((item) => item.modified_on !== null),
    };
  });
  if (admin?.role !== "ADMIN") {
    sorted_user = sorted_user
      .filter(
        (user) => user.reviewer_id === null || user.reviewer_id === admin?.id
      )
      .sort((a, b) => {
        if (a.reviewer_id === null && b.reviewer_id !== null) {
          return 1; // a should come after b
        } else if (a.reviewer_id !== null && b.reviewer_id === null) {
          return -1; // a should come before b
        } else {
          return 0; // no change in order
        }
      });
  }

  return json({
    users: sorted_user,
  });
};

export const meta = () => {
  return [
    { title: `Admin page | ${toolname}` },
    {
      name: "description",
      content: `admin page for ${toolname}`,
    },
  ];
};

function Index() {
  const current_user = useOutletContext();
  const { users } = useLoaderData();
  const reviewers = users.filter((user) => user.role === "REVIEWER");

  return (
    <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5 ">
      <div className="col-span-12 xl:col-span-8 ">
        <Outlet context={{ current_user, reviewers }} />
      </div>
      <UserListCard />
    </div>
  );
}

export default Index;
