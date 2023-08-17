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
  let groups_list = ["annotator", "reviewer"];

  let { user, userlist, unasigned_groups, textInfo, groups } = useLoaderData();
  let [search, setSearch] = useState("");
  let list = userlist.filter((data) => data.username.includes(search));
  let fetcher = useFetcher();
  let userFetcher = useFetcher();
  let [group, setGroup] = useState("all");

  let colorScheme = [
    { color: "lightgreen", text: "all accepted" },
    { color: "pink", text: "some rejected" },
    { color: "yellow", text: "some Ignored" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link
          to={`/?session=${user.username}`}
          style={{
            textDecoration: "none",
            color: "white",
            background: "gray",
            padding: 10,
          }}
        >
          Home
        </Link>
        <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
          {colorScheme?.map((data) => {
            return (
              <div
                style={{ display: "flex", alignItems: "center" }}
                key={data.color + "unique"}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 20,
                    height: 20,
                    marginInline: 10,
                    backgroundColor: data.color,
                    border: "1px solid black",
                  }}
                ></span>
                {data.text}
              </div>
            );
          })}
        </div>
      </div>
      <h1>welcome Admin : {user.username}</h1>
      <select onChange={(e) => setGroup(e.target.value)}>
        {groups_list.map((data) => {
          return (
            <option value={data} key={data + "option-dashboard"}>
              {data}
            </option>
          );
        })}
      </select>
      <TextDashboard info={textInfo} />
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>Users:</h2>
          <input
            style={{ marginLeft: 10 }}
            placeholder="search"
            onChange={(e) => setSearch(e.target.value)}
          ></input>
        </div>
      </div>

      {userlist.length > 0 && (
        <table>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Assigned Jobs</th>
          </tr>
          {list
            .filter((g) => {
              return g.role === group;
            })
            .map((user: User) => (
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
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        <div className="flex gap-3">
          {user.assigned_batch.map((data, index) => (
            <button
              key={data + "btn"}
              className={classNames(
                " border-2 px-2 border-gray-500 cursor-pointer ",
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
              {data}
            </button>
          ))}
          {user.assigned_batch_for_review.map((data, index) => {
            return (
              <button
                key={data + "btn"}
                className={classNames(
                  "px-2 border-2 border-gray-500 cursor-pointer ",
                  { "bg-yellow-500": !!reviewedBatch?.at(data) },
                  { "bg-white": !reviewedBatch?.at(data) }
                )}
                onClick={() => removeReviewAsign(data)}
              >
                {data}
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
  let classname = "border-2 border-gray-500 p-3 w-48";
  return (
    <>
      <h2>Text Dashboard</h2>
      <div className="flex flex-wrap gap-4 mb-4">
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
