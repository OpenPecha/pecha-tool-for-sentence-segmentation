import { User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import classNames from "classnames";
import { useRef, useState } from "react";
import { getAprovedbatch, getTextInfo } from "~/model/text";
import {
  addGroupToUser,
  assignReview,
  changeUserGroup,
  getReviewerList,
  getUser,
  getUsers,
  removeAllGroupFromUser,
  removeAsignedReview,
  removeGroupFromUser,
} from "~/model/user";
import { getCategories } from "~/model/utils/category";
import { AiFillHome } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import AsignCategory from "~/components/AsignCategory";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let user: User | null = await getUser(session);
  if (user?.role !== "admin") return redirect("/error");
  let userlist = await getUsers();
  let textInfo = await getTextInfo();
  let groups = await getAprovedbatch();
  let categories = await getCategories();
  let reviewers = await getReviewerList();
  return {
    user,
    userlist,
    textInfo,
    groups,
    categories,
    reviewers,
  };
};
export function meta() {
  return [
    { title: "Admin Page" },
    { name: "description", content: "admin page for pechatool" },
  ];
}
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

function admin() {
  let { user, userlist, textInfo, reviewers } = useLoaderData();
  let [search, setSearch] = useState("");
  let list = userlist.filter((data) => data.username.includes(search));
  let userFetcher = useFetcher();
  let [filter, setFilter] = useState("all");
  let colorScheme = [
    { color: "bg-green-500", text: "all accepted" },
    { color: "bg-red-500", text: "some rejected" },
  ];
  const revalidator = useRevalidator();
  let resetUsers = async () => {
    let c = confirm("Are you sure you want to reset all users?");
    if (!c) return;
    userFetcher.submit(
      {
        action: "reset",
      },
      {
        method: "DELETE",
        action: "/api/user",
      }
    );
  };
  return (
    <>
      <div className="flex justify-between items-center bg-gray-400 shadow-sm">
        <Link
          to={`/?session=${user.username}`}
          className="text-white bg-gray-500 p-2 w-10"
        >
          <AiFillHome />
        </Link>

        <div className="flex  mr-2 gap-2 p-1">
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
        <button
          disabled={revalidator.state !== "idle"}
          onClick={() => revalidator.revalidate()}
          className="text-white bg-gray-500 p-2 w-10"
        >
          <FiRefreshCw />
        </button>
      </div>
      <div className="bg-gray-100 my-2 shadow-md p-2">
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
          <div className="flex gap-3  mx-auto">
            <label className="input-group">
              <span>reviewer:</span>
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="select select-bordered select-sm w-full max-w-xs"
              >
                <option selected value="all">
                  All
                </option>
                {reviewers?.map((reviewer) => (
                  <option value={reviewer.username} key={reviewer + "-key"}>
                    {reviewer.username}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <button
          className="btn-xs float-right -translate-y-3 flex justify-end hover:bg-gray-600 hover:text-white"
          type="button"
          onClick={resetUsers}
        >
          reset
        </button>
      </div>

      {userlist.length > 0 && (
        <div className="overflow-scroll">
          <table className="table table-xs">
            <thead>
              <tr>
                <th></th>
                <th>User</th>
                <th>Role</th>
                <th>category</th>
                <th>Assigned Jobs</th>
                <th>Approved </th>
                <th>Reviewed </th>
              </tr>
            </thead>
            <tbody>
              {list
                .sort((a, b) => {
                  if (a.role === "admin") return -1;
                  if (b.role === "admin") return 1;
                  if (a.role === "reviewer") return -1;
                  if (b.role === "reviewer") return 1;
                  return 0;
                })
                .filter((item) => {
                  if (filter === "all") return true;
                  return (
                    item.username === filter ||
                    item.reviewer?.username === filter
                  );
                })
                .map((user: User, index: number) => (
                  <Users
                    user={user}
                    key={user.id}
                    fetcher={userFetcher}
                    index={index}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Users({
  user,
  fetcher,
  index,
}: {
  user: User;
  fetcher: any;
  index: number;
}) {
  let { groups, reviewedBatch } = useLoaderData();
  let modelRef = useRef(null);
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
  let approved_count = user.approved_text.length;
  let reviewed_count = user.approved_text.filter(
    (i) => i.reviewed_text !== null
  ).length;
  return (
    <tr className="hover:bg-gray-300 border-b-gray-300 border-b-2">
      <th>{index + 1}</th>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        <AsignCategory user={user} editable={user.role === "reviewer"} />
      </td>
      <td>
        <button
          className=" p-1 w-32"
          onClick={() => modelRef?.current?.showModal()}
        >
          view
        </button>
        <dialog ref={modelRef} className="modal">
          <form method="dialog" className="modal-box">
            <button className=" btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <div className="flex gap-3">
              {user.assigned_batch.map((data, index) => (
                <button
                  key={data + "btn"}
                  className={classNames(
                    " border-2 px-1 border-gray-500 cursor-pointer ",
                    groups[data]?.approved
                      ? "bg-green-300"
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
          </form>
        </dialog>
      </td>
      <td>{approved_count}</td>
      <td>{reviewed_count}</td>
    </tr>
  );
}

function TextDashboard({ info }) {
  let { total, accepted, rejected, reviewed } = info;

  return (
    <>
      <h2 className="text-lg text-center underline">Dashboard</h2>
      <div className="flex flex-wrap gap-4 mb-4 w-full justify-center">
        <EachInfo>Total text: {total}</EachInfo>
        <EachInfo>Accepted text: {accepted}</EachInfo>
        <EachInfo>Rejected text: {rejected}</EachInfo>
        <EachInfo>reviewed text: {reviewed}</EachInfo>
        <EachInfo>1 Group = 10 Text</EachInfo>
      </div>
    </>
  );
}

export function EachInfo({ children }) {
  return (
    <div className=" p-3 w-48 shadow-md flex justify-center">{children}</div>
  );
}

export default admin;
