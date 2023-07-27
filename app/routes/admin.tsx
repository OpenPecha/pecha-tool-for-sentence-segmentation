import { User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { LinkDescriptor } from "@remix-run/react/dist/links";
import { getUnAsignedGroups } from "~/model/text";
import {
  addGroupToUser,
  getUser,
  getUsers,
  removeGroupFromUser,
} from "~/model/user";
import adminStyle from "~/styles/admin.css";
import { useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user: User | null = await getUser(session);
  if (user?.role !== "ADMIN") return redirect("/error");
  let userlist = await getUsers();
  let unasigned_groups = await getUnAsignedGroups();

  return { user, userlist, unasigned_groups };
};

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  if (request.method === "POST") {
    let group = formdata.get("group") as string;
    let userId = formdata.get("id") as string;
    let added = await addGroupToUser(parseInt(group), userId);
    return added;
  }
  if (request.method === "DELETE") {
    let group = formdata.get("group") as string;
    let userId = formdata.get("id") as string;
    let removed = await removeGroupFromUser(parseInt(group), userId);
    return removed;
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
  let { user, userlist, unasigned_groups } = useLoaderData();
  return (
    <div>
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
      <h1>welcome Admin : {user.username}</h1>
      <div>Users:</div>
      {userlist.length > 0 && (
        <table>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Assigned Jobs</th>
          </tr>
          {userlist.map((user: User) => (
            <Users user={user} key={user.id} select={unasigned_groups} />
          ))}
        </table>
      )}
    </div>
  );
}

function Users({ user, select }: { user: User; select: [] }) {
  let fetcher = useFetcher();
  let addGroup = (e) => {
    if (select[0] > -1)
      fetcher.submit(
        { group: select[0], id: user.id },
        {
          method: "POST",
        }
      );
  };
  let removeGroup = (e) => {
    let c = confirm("Are you sure you want to remove this group from user?");
    if (c)
      fetcher.submit(
        { group: e, id: user.id },
        {
          method: "DELETE",
        }
      );
  };

  return (
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td style={{ display: "flex" }}>
        <div>
          {user.assigned_group.map((data) => (
            <span
              style={{
                marginRight: 5,
                border: "1px solid gray",
                padding: 3,
                cursor: "pointer",
              }}
              key={data}
              onClick={() => removeGroup(data)}
            >
              {data}
            </span>
          ))}
        </div>
        <button
          onClick={addGroup}
          style={{ padding: 5, border: "1px solid black", cursor: "pointer" }}
        >
          +
        </button>
      </td>
    </tr>
  );
}

export default admin;
