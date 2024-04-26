import { useLoaderData } from "@remix-run/react";
import React from "react";

function TopInfo() {
  let { users, numberOfTask, numberOfReviewedTask } = useLoaderData();
  let numberOfAnnotators = users?.filter(
    (l) => l?.role === "ANNOTATOR"
  )?.length;
  return (
    <div className="flex max-w-6xl mb-2 mx-auto gap-2 justify-between mt-2">
      <div className="w-fit  p-3 bg-white rounded-lg shadow border border-neutral-200 flex-col justify-start items-start inline-flex">
        <div className="self-stretch h-20 flex-col justify-start items-start gap-3 flex">
          <div className="self-stretch h-20 flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch text-neutral-900 text-3xl font-bold font-['Inter'] leading-10">
              {numberOfAnnotators}
            </div>
            <div className="self-stretch text-neutral-500 text-base font-normal font-['Inter'] leading-normal">
              Number of Annotators
            </div>
          </div>
        </div>
      </div>
      <div className="w-fit  p-3 bg-white rounded-lg shadow border border-neutral-200 flex-col justify-start items-start inline-flex">
        <div className="self-stretch h-20 flex-col justify-start items-start gap-3 flex">
          <div className="self-stretch h-20 flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch text-neutral-900 text-3xl font-bold font-['Inter'] leading-10">
              {numberOfTask}
            </div>
            <div className="self-stretch text-neutral-500 text-base font-normal font-['Inter'] leading-normal">
              Total Number of Task
            </div>
          </div>
        </div>
      </div>
      <div className="w-fit  p-3 bg-white rounded-lg shadow border border-neutral-200 flex-col justify-start items-start inline-flex">
        <div className="self-stretch h-20 flex-col justify-start items-start gap-3 flex">
          <div className="self-stretch h-20 flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch text-neutral-900 text-3xl font-bold font-['Inter'] leading-10">
              {numberOfReviewedTask}
            </div>
            <div className="self-stretch text-neutral-500 text-base font-normal font-['Inter'] leading-normal">
              Total Number Reviewed Task
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopInfo;
