import { User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import MultiSelect from "~/components/MultiSelect";
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
  let { user, userlist, unasigned_groups, textInfo, reviewers } =
    useLoaderData();
  let [search, setSearch] = useState("");
  let list = userlist.filter((data) => data.username.includes(search));
  let userFetcher = useFetcher();
  let [filter, setFilter] = useState("all");
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
      <div className="overflow-x-auto max-h-[60vh] overflow-y-scroll">
        {userlist.length > 0 && (
          <table className="table table-xs border-collapse">
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>category</th>
              <th>Assigned Jobs</th>
            </tr>
            {list
              .filter((item) => {
                if (filter === "all") return true;
                return (
                  item.username === filter || item.reviewer?.username === filter
                );
              })
              .map((user: User) => (
                <Users user={user} key={user.id} fetcher={userFetcher} />
              ))}
          </table>
        )}
      </div>
    </>
  );
}

function Users({ user, fetcher }: { user: User; fetcher: any }) {
  let { groups, reviewedBatch, categories } = useLoaderData();
  const [openEditCategory, setOpenEditCategory] = useState(false);

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
  let fet = useFetcher();
  function handleClick(category) {
    let data = [...user.categories, category];
    if (user.categories.includes(category)) {
      data = user.categories.filter((c) => c !== category);
    }
    fet.submit(
      {
        id: user.id,
        categories: JSON.stringify(data),
        action: "change_categories",
      },
      {
        method: "POST",
        action: "/api/user",
      }
    );
    setOpenEditCategory(false);
  }
  return (
    <tr className="hover:bg-gray-300 border-b-gray-300 border-b-2">
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        {!openEditCategory && user.categories.length > 0 && (
          <>
            {user.categories.map((c) => {
              return <span className="badge bg-green-300">{c}</span>;
            })}
          </>
        )}
        {!openEditCategory && user.role === "reviewer" && (
          <button
            onClick={() => setOpenEditCategory(true)}
            className="mx-1 -translate-y-2"
          >
            <FiEdit2 size={10} />
          </button>
        )}
        {openEditCategory &&
          categories.map((category) => (
            <EachCategory
              user={user}
              category={category}
              key={category + "_cat"}
              handleClick={() => handleClick(category)}
            />
          ))}
      </td>
      <td>
        <button
          className="h-10 w-32"
          onClick={() => window.my_modal_2.showModal()}
        >
          check
        </button>
        <dialog id="my_modal_2" className="modal">
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
          </form>
        </dialog>
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

function EachCategory({ user, category, handleClick }) {
  return (
    <span
      className={`p-1 shadow-sm border-2 border-gray-200 cursor-pointer ${
        user.categories.includes(category) ? "bg-green-300" : ""
      }`}
      onClick={handleClick}
    >
      {category}
    </span>
  );
}

export default admin;
