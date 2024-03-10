import { useFetcher } from "@remix-run/react";
import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { memo } from "react";
function AssignNickName({ user }: { user: any }) {
  const fetcher = useFetcher();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openEdit, setOpenEdit] = React.useState(false);
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
    <>
      {!openEdit ? (
        <div className="flex gap-3">
          {fetcher?.formData?.get("nickname") || user.nickname}
          <button onClick={() => setOpenEdit(true)}>
            <FiEdit2 />
          </button>
        </div>
      ) : (
        <div className="join ">
          <input
            type="text"
            defaultValue={user.nickname!}
            name="nickname"
            ref={inputRef}
            className="input input-bordered join-item"
          />
          <button
            type="button"
            className="btn join-item"
            onClick={handleSubmit}
          >
            <TiTick color="green" />
          </button>
          <button
            type="button"
            className="btn join-item"
            onClick={() => setOpenEdit(false)}
          >
            <ImCross color="red" />
          </button>
        </div>
      )}
    </>
  );
}

export default memo(AssignNickName);
