import { User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import React from "react";

function ReviewerDetail({ user }: { user: User }) {
  let approve_count = user.approved_text.length / 2;
  let reviewed_count = user.reviewed_list.length / 2;
  let reviewed = `${reviewed_count - approve_count}`;
  const pay = approve_count * 100 + reviewed * 50;
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
  return (
    <>
      <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-5">
        <EachInfo title="Approved" count={approve_count} />
        <EachInfo title="Reviewed" count={reviewed} />
        <EachInfo title="Payment" count={"Rs " + pay} />
      </div>
      <div className="flex gap-2">
        <label className="cursor-pointer label">annotate</label>
        <input
          type="checkbox"
          className={`toggle toggle-success `}
          disabled={fetcher.state !== "idle"}
          defaultChecked={user?.allow_annotation!}
          onChange={handleToggleAssign}
          aria-label="Toggle_role"
        />
      </div>
    </>
  );
}

const EachInfo = ({ title, count }) => {
  return (
    <div className="card w-full md:w-80 mx-auto bg-neutral text-neutral-content">
      <div className="card-body p-1 md:p-2 items-center text-center">
        <h2 className="card-title">{title}</h2>
        <div className="card-actions justify-end">{count}</div>
      </div>
    </div>
  );
};

export default ReviewerDetail;
