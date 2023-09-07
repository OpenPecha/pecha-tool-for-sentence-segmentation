import React, { useState, useEffect } from "react";
import AssignedBatchList from "../AssignedBatchList";
import {
  Link,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { User } from "@prisma/client";
import { useSocket } from "../contexts/SocketContext";
import { FiEdit2 } from "react-icons/fi";
import AssignCategory from "../AssignCategory";
import AssignReviewer from "../AssignReviewer";
import AssignNickName from "../AssignNickName";

type UserType = User & { reviewer: User[]; nickname: string };

function UserTab() {
  const { users, user, reviewers } = useLoaderData();

  let isReviewer = user.role === "REVIEWER";

  if (selectedReviewer !== "All") {
    list = list.filter(
      (user: User & { reviewer: User }) =>
        user?.reviewer?.username === selectedReviewer ||
        user?.username === selectedReviewer
    );
  }
  if (isReviewer) {
    list = list.filter((annotator: User) => annotator.reviewer_id === user.id);
  }
  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 mt-2 justify-between"></div>
      {users.length > 0 && (
        <div className="overflow-scroll max-h-[77dvh] max-w-[100dvw]  mt-3">
          <table className="table ">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Active</th>
                <th>Approved/Reviewed</th>
                <th className="max-w-[500px]">Assigned Jobs</th>
              </tr>
            </thead>
            <tbody>
              {list.map((annotator: UserType) => (
                <Users user={annotator} key={user.id} admin={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Users({ user, admin }: { user: UserType; admin: User }) {
  const [isOpen, setIsOpen] = useState(false);
  let url = `/admin/${user.username}?session=${admin.username}`;
  const fetcher = useFetcher();

  function Info({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col items-start px-2 text-lg mt-2">
        {children}
      </div>
    );
  }
  function Title({ children }: { children: React.ReactNode }) {
    return <div className="text-lg font-bold">{children}</div>;
  }

  return (
    <>
      <tr>
        <td className="flex gap-2">
          <Link to={url} className="text-inherit">
            {fetcher?.formData?.get("nickname") || user.nickname}
          </Link>
          <div onClick={() => setIsOpen((p) => !p)} className="cursor-pointer">
            <FiEdit2 />
          </div>
        </td>
        <td>{user.role}</td>
        <td></td>
        <td>
          {approved_count}/{reviewed_count}
        </td>
        <td className="flex gap-2 max-w-[500px] ">
          <AssignedBatchList user={user} />
        </td>
      </tr>
    </>
  );
}
export default UserTab;
