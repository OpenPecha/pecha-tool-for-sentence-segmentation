import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useRef } from "react";
import { FiEdit2 } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { error_and_pay } from "~/lib/payCalc";
import { User } from "@prisma/client";
import AssignCategory from "./AsignCategory";

type TextType = Text & {
  reviewed_text: Text;
};

type UserType = User & {
  approved_text: TextType[];
  reviewed_list: TextType[];
  reviewer: User;
};

type TableProps = {
  users: UserType[];
};
type RowProps = {
  user: UserType;
  index: number;
};
function Table({ users }: TableProps) {
  return (
    <div className="overflow-scroll">
      <table className="table table-xs">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Reviewed</th>
            <th>Error</th>
            <th>active</th>
            <th>reviewer</th>
            <th>category</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <Row key={index + "_count"} user={user} index={index} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Reviewed</th>
            <th>Error</th>
            <th>active</th>
            <th>reviewer</th>
            <th>category</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Row({ user, index }: RowProps) {
  let approved = user.approved_text.length;
  let reviewed = user.approved_text.filter(
    (item) => item.reviewed_text !== null
  ).length;
  let { reviewers, categories } = useLoaderData();
  let { finalErrorCount, pay } = error_and_pay(user);
  const inputRef = useRef(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  let fetcher = useFetcher();

  function handleToggleAssign() {
    fetcher.submit(
      {
        id: user.id,
        allow: !user.allow_annotation,
        action: "change_allow_assign",
      },
      {
        action: "/api/user",
        method: "POST",
      }
    );
  }
  function handleSubmit() {
    let value = inputRef.current?.value;
    if (!value) return;
    fetcher.submit(
      {
        id: user.id,
        nickname: value,
        action: "change_nickname",
      },
      {
        action: "/api/user",
        method: "POST",
      }
    );
    setOpenEdit(false);
  }
  function handleReviewerChange(e) {
    let reviewer_id = e.target.value;
    let reviewer_name = reviewers.find((r) => r.id === reviewer_id).username;
    let d = confirm("Are you sure? u want to assign " + reviewer_name);
    if (d) {
      fetcher.submit(
        {
          id: user.id,
          reviewer_id,
          action: "change_reviewer",
        },
        { method: "POST", action: "/api/user" }
      );
    }
  }

  return (
    <tr className="hover:bg-gray-300 border-b-gray-300 border-b-2">
      <th>{index + 1}</th>
      <td>
        {user.username}
        {!openEdit ? (
          <>
            <span className="ml-2 text-gray-400">
              {fetcher?.formData?.get("nickname") || user.nickname}
            </span>
            <button
              onClick={() => setOpenEdit(true)}
              className="mx-1 -translate-y-2"
            >
              <FiEdit2 size={10} />
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              defaultValue={user.nickname!}
              name="nickname"
              ref={inputRef}
              className="input input-xs input-bordered w-24 ml-2 max-w-xs"
            />
            <button type="button" onClick={handleSubmit}>
              <TiTick color="green" size={24} />
            </button>
            <button type="button" onClick={() => setOpenEdit(false)}>
              <ImCross color="red" size={20} />
            </button>
          </>
        )}
      </td>
      <td>{user.role}</td>
      <td>{approved}</td>
      <td>{reviewed}</td>
      <td>{finalErrorCount} %</td>
      <td>
        <input
          type="checkbox"
          className={`toggle toggle-success `}
          disabled={fetcher.state !== "idle" || !user.reviewer}
          checked={user?.allow_annotation!}
          onChange={handleToggleAssign}
          aria-label="Toggle_role"
        />
      </td>
      <td>
        {user.reviewer ? (
          user.reviewer.username
        ) : (
          <select
            defaultValue={0}
            onChange={handleReviewerChange}
            className="select select-bordered select-sm w-full max-w-xs"
          >
            <option selected value={0}>
              select
            </option>
            {reviewers.map((reviewer: User) => (
              <option key={reviewer.id} value={reviewer.id}>
                {reviewer.username}
              </option>
            ))}
          </select>
        )}
      </td>
      <td>
        <AssignCategory user={user} editable={user.role === "annotator"} />
      </td>
    </tr>
  );
}

export default Table;
