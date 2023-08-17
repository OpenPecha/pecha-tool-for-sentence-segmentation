import { useFetcher } from "@remix-run/react";
import React, { useState, useRef } from "react";
import { FiEdit2 } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { error_and_pay } from "~/lib/payCalc";
function Table({ users }) {
  return (
    <div className="overflow-x-auto h-[80dvh]">
      <table className="table table-md">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Reviewed</th>
            <th>Error</th>
            <th>Payment</th>
            <th>active</th>
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
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Row({ user, index }) {
  let approved = user.approved_text.length;
  let reviewed = user.approved_text.filter((item) => item.reviewed).length;
  let { finalErrorCount, pay } = error_and_pay(user);
  const inputRef = useRef();
  const [openEdit, setOpenEdit] = useState(false);
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
  return (
    <tr>
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
          className={`toggle toggle-success ${
            fetcher.state !== "idle" &&
            "cursor-not-allowed opacity-50 pointer-events-non"
          }`}
          defaultChecked={user?.allow_annotation!}
          onChange={handleToggleAssign}
          aria-label="Toggle_role"
        />
      </td>
    </tr>
  );
}

export default Table;
