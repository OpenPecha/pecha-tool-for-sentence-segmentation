import { User } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
const UserListCard = ({
  setSelectedUser,
  selectedUser,
  user,
}: {
  user: any;
  selectedUser: string | null;
  setSelectedUser: (data: string) => void;
}) => {
  let { users } = useLoaderData();
  let reviewers = users.filter((user) => user.role === "REVIEWER");
  let isAdmin = user.role === "ADMIN";
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
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 pl-2 px-7.5 text-xl font-semibold text-black dark:text-white">
        Annotators
      </h4>
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
            {reviewers.map((reviewer: User) => (
              <option
                value={reviewer.username}
                key={reviewer.id + "-key-selection"}
              >
                {reviewer.username}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        {list.map((user: any) => (
          <EachUser
            key={user.id + "unique_key"}
            user={user}
            setSelectedUser={setSelectedUser}
            selectedUser={selectedUser}
          />
        ))}
      </div>
    </div>
  );
};

function EachUser({ user, setSelectedUser, selectedUser }) {
  let { groups } = useLoaderData();

  const handleSelection = (value: string) => {
    console.log("hi from userlistcard");
    setSelectedUser(value);
  };
  let currentBatch = user.assigned_batch.filter(
    (item) => !groups[item]?.reviewed && groups[item]?.approved
  );

  return (
    <div
      key={user.id + "-userList"}
      onClick={() => handleSelection(user.username)}
      className={` cursor-pointer flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4 hover:rounded-sm transition duration-300 ease-in-out hover:bg-green-300 ${
        selectedUser === user.username && "bg-green-300"
      }`}
    >
      <div className="flex flex-1 items-center justify-between px-2">
        <div>
          <h5 className="font-medium text-black dark:text-white">
            {user.nickname}
          </h5>
          <p>
            <span className="text-sm text-black dark:text-white">
              {user.username}
            </span>
            <span className="text-xs"> . 12 min</span>
          </p>
        </div>
        {currentBatch.length > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <span className="text-xs text-white">{currentBatch.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserListCard;
