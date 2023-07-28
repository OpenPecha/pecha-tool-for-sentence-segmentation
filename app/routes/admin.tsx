import { User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getAprovedGroup, getTextInfo, getUnAsignedGroups } from "~/model/text";
import {
  addGroupToUser,
  getUser,
  getUsers,
  removeAllGroupFromUser,
  removeGroupFromUser,
} from "~/model/user";
import adminStyle from "~/styles/admin.css";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user: User | null = await getUser(session);
  if (user?.role !== "ADMIN") return redirect("/error");
  let userlist = await getUsers();
  let unasigned_groups = await getUnAsignedGroups();
  let textInfo = await getTextInfo();
  let groups = await getAprovedGroup();
  return { user, userlist, unasigned_groups, textInfo, groups };
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
    let action = formdata.get("action") as string;
    if (action === "reset") {
      let reset = await removeAllGroupFromUser();
      return reset;
    } else {
      let removed = await removeGroupFromUser(parseInt(group), userId);
      return removed;
    }
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

  let reset = () => {
    let checkrejected = false;
    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        if (groups[key].rejected === true) {
          checkrejected = true; // Found data with rejected=true
        }
      }
    }
    // let checkrejected = groups.filter((data) => data.rejected === true);
    // console.log(checkrejected);
    if (checkrejected) {
      alert(
        "some group contain rejected data, contact the annotator to either ignore or accept!"
      );
    } else {
      let c = confirm("Are you sure you want to reset all users group?");
      if (c)
        fetcher.submit(
          {
            action: "reset",
          },
          {
            method: "DELETE",
          }
        );
    }
  };
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
              <div style={{ display: "flex", alignItems: "center" }}>
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
        <button onClick={reset} style={{ marginRight: 20 }}>
          Reset
        </button>
      </div>

      {userlist.length > 0 && (
        <table>
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
  );
}

function Users({
  user,
  select,
  fetcher,
}: {
  user: User;
  select: [];
  fetcher: any;
}) {
  let { groups } = useLoaderData();
  let addGroup = (e) => {
    let nextGroup = select[0];
    if (typeof nextGroup === "undefined") alert("no more group to assign");
    if (nextGroup > -1)
      fetcher.submit(
        { group: nextGroup, id: user.id },
        {
          method: "POST",
        }
      );
  };
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
  let adding =
    fetcher.formData?.get("id") === user.id && fetcher.formMethod === "POST";
  let removing =
    fetcher.formData?.get("id") === user.id && fetcher.formMethod === "DELETE";

  return (
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        <div>
          {user.assigned_group.map((data) => (
            <button
              key={data + "btn"}
              style={{
                marginRight: 5,
                border: "1px solid gray",
                padding: 3,
                cursor: "pointer",
                background: groups[data].approved
                  ? "lightgreen"
                  : groups[data].ignored.includes(user.username)
                  ? "yellow"
                  : groups[data].rejected
                  ? "pink"
                  : "white",
              }}
              onClick={() => removeGroup(data)}
            >
              {data}
            </button>
          ))}
        </div>
        <button
          onClick={addGroup}
          disabled={fetcher.state !== "idle"}
          style={{ padding: 5, border: "1px solid black", cursor: "pointer" }}
        >
          {adding ? "adding" : "add"}
        </button>
        {removing && <span>removed</span>}
      </td>
    </tr>
  );
}

function TextDashboard({ info }) {
  let { total, accepted, rejected, pending } = info;
  let menuStyle = {
    border: "1px solid gray",
    padding: 10,
    width: 200,
  };
  return (
    <>
      <h2>Text Dashboard</h2>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 20 }}
      >
        <div style={menuStyle}>Total text: {total}</div>
        <div style={menuStyle}>Accepted text: {accepted}</div>
        <div style={menuStyle}>Rejected text: {rejected}</div>
        <div style={menuStyle}>Pending text: {pending}</div>
        <div style={menuStyle}>1 Group = 10 Text</div>
      </div>
    </>
  );
}
export default admin;
