import { User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { EachInfo } from "~/routes/admin";

function ReviewerDetail({ user }: { user: User }) {
  let approve_count = user.approved_text.length / 2;
  let reviewed_count: number | string = user.reviewed_list.length / 2;
  reviewed_count = `${reviewed_count - approve_count}`;
  const pay = approve_count * 100 + reviewed_count * 50;
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
    <div className="bg-gray-100 my-2 shadow-md p-2">
      <div className="flex flex-wrap gap-4 mb-4 mt-4 w-full justify-center">
        <EachInfo>Reviewed: {reviewed_count}</EachInfo>
        <EachInfo>Earn: ₹ {pay}</EachInfo>
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
    </div>
  );
}

export default ReviewerDetail;
