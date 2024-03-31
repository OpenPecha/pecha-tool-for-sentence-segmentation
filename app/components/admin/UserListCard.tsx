import { User } from "@prisma/client";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import { timeAgo } from "~/lib/getFormattedDate";
const UserListCard = () => {
  let { users } = useLoaderData();
  const current_user = useOutletContext();
  let reviewers = users.filter((user) => user.role === "REVIEWER");
  let isAdmin = current_user?.role === "ADMIN";
  const [selectedReviewer, setSelectedReviewer] = useState("All");
  const [search, setSearch] = useState("");

  function handleReviewerChange(e) {
    let selectedReviewer = e.target.value;
    setSelectedReviewer(selectedReviewer);
  }
  let list = users.filter((annotator: User) =>
    annotator.username.includes(search)
  );
  if (selectedReviewer !== "All") {
    list = list.filter(
      (user: User & { reviewer: User }) =>
        user?.reviewer?.username === selectedReviewer ||
        user?.username === selectedReviewer
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white dark:bg-slate-600 py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="flex justify-between px-2">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Annotators
        </h4>
      </div>
      <div className="flex gap-2  items-center flex-1 mb-2 mx-2">
        <input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="user search"
          className="input input-sm input-bordered w-full max-w-xs"
        />
      </div>
      {isAdmin && (
        <div className="flex gap-2  items-center mb-2 mx-2">
          <select
            id="reviewer-select"
            className="select select-sm select-bordered w-full max-w-xs"
            onChange={handleReviewerChange}
            value={selectedReviewer}
          >
            <option value={"All"}>All</option>
            {reviewers.map((reviewer: User, index: number) => (
              <option
                value={reviewer.username}
                key={reviewer.id + "-key-" + index}
              >
                {reviewer.username}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        {list.map((user: any) => (
          <EachUser user={user} key={user} />
        ))}
      </div>
    </div>
  );
};

function EachUser({ user }) {
  const current_user = useOutletContext();

  let remaining_count = user?.text;
  let Time = user?.modified_on;
  let time_ago = timeAgo(Time?.modified_on);
  if (!user) return null;
  return (
    <Link
      key={user.id + "unique_key"}
      to={`/admin/user/${user.username}?session=` + current_user?.username}
      className={` cursor-pointer flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4 hover:rounded-sm transition duration-300 ease-in-out hover:bg-green-300`}
    >
      {user.picture ? (
        <div className="avatar ml-2">
          <div className="w-[40px] rounded-full">
            <img src={user.picture} alt="" />
          </div>
        </div>
      ) : (
        <div className="avatar placeholder ml-2">
          <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
            <span>{user.username.charAt(0)}</span>
          </div>
        </div>
      )}
      <div className="flex flex-1 items-center justify-between px-2">
        <div className="w-full">
          <div className="font-medium text-black dark:text-white flex justify-between items-center w-full">
            <div>{user.nickname}</div>
            <div className="text-xs ">{time_ago}</div>
          </div>
          <p className="flex justify-between items-center">
            <span className="text-sm text-black dark:text-white">
              {user.username}
            </span>
          </p>
        </div>

        {remaining_count > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <span className="text-xs text-white">{remaining_count}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default UserListCard;
