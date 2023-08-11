import { User } from "@prisma/client";
import React from "react";

function ReviewerDetail({ user }: { user: User }) {
  let approve_count = user.approved_text.length / 2;
  let reviewed_count = user.reviewed_list.length / 2;
  let reviewed = `${reviewed_count - approve_count}`;
  const pay = approve_count * 100 + reviewed * 50;
  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
      <EachInfo title="Approved" count={approve_count} />
      <EachInfo title="Reviewed" count={reviewed} />
      <EachInfo title="Payment" count={"Rs " + pay} />
    </div>
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
