import { Group, User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { useState } from "react";
import { getAprovedbatch, getTextInfo } from "~/model/text";
import {
  addGroupToUser,
  assignReview,
  changeUserGroup,
  getUser,
  getUsers,
  removeAllGroupFromUser,
  removeAsignedReview,
  removeGroupFromUser,
} from "~/model/user";
import adminStyle from "~/styles/admin.css";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user: User | null = await getUser(session);
  if (user?.role !== "admin") return redirect("/error");
  let userlist = await getUsers();
  let textInfo = await getTextInfo();
  let groups = await getAprovedbatch();
  return {
    user,
    userlist,
    textInfo,
    groups,
  };
};

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  if (request.method === "POST") {
    let group = formdata.get("group") as string;
    let userId = formdata.get("id") as string;
    let reviewer = formdata.get("reviewer") as string;
    if (reviewer) {
      let added = await assignReview(group, userId);
      return added;
    }
    let added = await addGroupToUser(group, userId);
    return added;
  }
  if (request.method === "DELETE") {
    let group = formdata.get("group") as string;
    let userId = formdata.get("id") as string;
    let action = formdata.get("action") as string;
    let review = formdata.get("review") as string;
    if (review) {
      let removed = await removeAsignedReview(group, userId);
      return removed;
    }

    if (action === "reset") {
      let reset = await removeAllGroupFromUser();
      return reset;
    } else {
      let removed = await removeGroupFromUser(group, userId);
      return removed;
    }
  }
  if (request.method === "PATCH") {
    let group = formdata.get("group") as Group;
    let userId = formdata.get("id") as string;
    let user = await changeUserGroup(group, userId);
    return user;
  }
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: adminStyle,
    },
  ];
};

function admin() {
  let { user, userlist, unasigned_groups, textInfo, groups } = useLoaderData();
  let [search, setSearch] = useState("");
  let list = userlist.filter((data) => data.username.includes(search));
  let fetcher = useFetcher();
  let userFetcher = useFetcher();

  let colorScheme = [
    { color: "bg-green-500", text: "all accepted" },
    { color: "bg-red-500", text: "some rejected" },
  ];
  return (
    <>
      <div className="flex justify-between">
        <Link
          to={`/?session=${user.username}`}
          className="text-white bg-gray-500 p-2"
        >
          Home
        </Link>
        <div className="flex  mr-2 flex-col">
          {colorScheme?.map((data) => {
            return (
              <div
                className="flex items-center gap-2"
                key={data.color + "unique"}
              >
                <span
                  className={`inline-block w-[20px] h-[20px] border-2 border-black ${data.color}`}
                ></span>
                {data.text}
              </div>
            );
          })}
        </div>
      </div>
      <h1>Admin : {user.username}</h1>

      <TextDashboard info={textInfo} />
      <div className="mb-5 flex justify-between items-center ">
        <div className="flex gap-3  mx-auto">
          <h2>Users:</h2>
          <input
            placeholder="search"
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs ml-2"
          ></input>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[60vh] overflow-y-scroll">
        {userlist.length > 0 && (
          <table className="table table-xs border-collapse">
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Assigned Jobs</th>
            </tr>
            {list.map((user: User) => (
              <Users
                user={user}
                key={user.id}
                select={unasigned_groups}
                fetcher={userFetcher}
              />
            ))}
          </table>
        )}
      </div>
    </>
  );
}

function Users({
  user,
  select,
  fetcher,
}: {
  user: User;
  select: string[];
  fetcher: any;
}) {
  let { groups, reviewedBatch } = useLoaderData();
  let removeGroup = (e) => {
    if (groups[e].rejected) {
      alert(
        "group contain rejected data, contact the annotator to either ignore or accept!"
      );
      return null;
    }
    let c = confirm("Are you sure you want to remove this group from user?");
    if (c)
      fetcher.submit(
        { group: e, id: user.id },
        {
          method: "DELETE",
        }
      );
  };
  let removeReviewAsign = (e) => {
    let c = confirm("Are you sure you want to remove this group from user?");
    if (c)
      fetcher.submit(
        { group: e, id: user.id, review: true },
        {
          method: "DELETE",
        }
      );
  };

  let removing =
    fetcher.formData?.get("id") === user.id && fetcher.formMethod === "DELETE";

  return (
    <tr className="hover:bg-gray-300 border-b-gray-300 border-b-2">
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        <div className="flex gap-3">
          {user.assigned_batch.map((data, index) => (
            <button
              key={data + "btn"}
              className={classNames(
                " border-2 px-1 border-gray-500 cursor-pointer ",
                groups[data]?.approved
                  ? "bg-green-300"
                  : groups[data]?.ignored.includes(user.username)
                  ? "bg-yellow-500"
                  : groups[data]?.rejected
                  ? "bg-pink-500"
                  : "bg-white"
              )}
              onClick={() => removeGroup(data)}
            >
              {data.split("_")[1]}
            </button>
          ))}
          {user.assigned_batch_for_review.map((data, index) => {
            return (
              <button
                key={data + "btn"}
                className={classNames(
                  "px-1 border-2 border-gray-500 cursor-pointer ",
                  { "bg-yellow-500": !!reviewedBatch?.at(data) },
                  { "bg-white": !reviewedBatch?.at(data) }
                )}
                onClick={() => removeReviewAsign(data)}
              >
                {data.split("_")[1]}
              </button>
            );
          })}
        </div>

        {removing && <span>removed</span>}
      </td>
    </tr>
  );
}

function TextDashboard({ info }) {
  let { total, accepted, rejected, pending } = info;
  let classname = " p-3 w-48 shadow-md";
  return (
    <>
      <h2 className="text-lg text-center underline">Text Dashboard</h2>
      <div className="flex flex-wrap gap-4 mb-4 w-full justify-center">
        <div className={classname}>Total text: {total}</div>
        <div className={classname}>Accepted text: {accepted}</div>
        <div className={classname}>Rejected text: {rejected}</div>
        <div className={classname}>Pending text: {pending}</div>
        <div className={classname}>1 Group = 10 Text</div>
      </div>
    </>
  );
}
export default admin;
