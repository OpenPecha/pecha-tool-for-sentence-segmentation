import { Group, User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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
  // let { unassigned: unasigned_groups } = await getBatchs();
  // let unreviewed_groups = await getUnReviewedList();
  let textInfo = await getTextInfo();
  let groups = await getAprovedbatch();
  // let reviewedBatch = await getReviewedBatch();
  return {
    user,
    userlist,
    // unasigned_groups,
    textInfo,
    groups,
    // unreviewed_groups,
    // reviewedBatch,
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
let groups_list = ["ga", "gb", "reviewer"];

function admin() {
  let groups_list = ["all", "ga", "gb", "reviewer"];

  let { user, userlist, unasigned_groups, textInfo, groups } = useLoaderData();
  let [search, setSearch] = useState("");
  let list = userlist.filter((data) => data.username.includes(search));
  let fetcher = useFetcher();
  let userFetcher = useFetcher();
  let [group, setGroup] = useState("all");
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
        <button onClick={reset} style={{ marginRight: 20 }}>
          Reset
        </button>
      </div>

      {userlist.length > 0 && (
        <table>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Group</th>
            <th>Assigned Jobs</th>
          </tr>
          {list
            .filter((g) => {
              if (group === "all") return g;
              return g.group === group;
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
  let { groups, unreviewed_groups, reviewedBatch } = useLoaderData();
  let addGroup = () => {
    if (user.group === "reviewer") {
      if (typeof unreviewed_groups[0] !== "undefined")
        fetcher.submit(
          { group: unreviewed_groups[0], id: user?.id, reviewer: true },
          {
            method: "POST",
          }
        );
    } else {
      let nextGroup = select.find((element: string) =>
        element.startsWith(user.group + "_")
      );
      if (typeof nextGroup === "undefined") alert("no more group to assign");
      if (nextGroup)
        fetcher.submit(
          { group: nextGroup, id: user.id },
          {
            method: "POST",
          }
        );
    }
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
  let adding =
    fetcher.formData?.get("id") === user.id && fetcher.formMethod === "POST";
  let removing =
    fetcher.formData?.get("id") === user.id && fetcher.formMethod === "DELETE";
  const handleGroupChange = (group: Group) => {
    if (user.assigned_batch.length === 0) {
      fetcher.submit(
        {
          group,
          id: user.id,
        },
        {
          method: "PATCH",
        }
      );
    } else {
      alert("complete the asigned task or remove the task to change group");
    }
  };
  return (
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td
        style={{
          display: "flex",
          gap: 10,
          cursor: "pointer",
        }}
      >
        {groups_list.map((data) => (
          <div
            style={{
              background: data === user.group ? "lightgreen" : "white",
              paddingInline: 5,
            }}
            onClick={() => handleGroupChange(data)}
            key={data}
          >
            {data}
          </div>
        ))}
      </td>
      <td>
        <div>
          {user.assigned_batch.map((data, index) => (
            <button
              key={data + "btn"}
              style={{
                marginRight: 5,
                border: "1px solid gray",
                padding: 3,
                cursor: "pointer",
                background: groups[data]?.approved
                  ? "lightgreen"
                  : groups[data]?.ignored.includes(user.username)
                  ? "yellow"
                  : groups[data]?.rejected
                  ? "pink"
                  : "white",
              }}
              onClick={() => removeGroup(data)}
            >
              {data}
            </button>
          ))}
          {user.assigned_batch_for_review.map((data, index) => {
            return (
              <button
                key={data + "btn"}
                style={{
                  marginRight: 5,
                  border: "1px solid gray",
                  padding: 3,
                  cursor: "pointer",
                  background: reviewedBatch[data] ? "lightgreen" : "white",
                }}
                onClick={() => removeReviewAsign(data)}
              >
                {data}
              </button>
            );
          })}
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
