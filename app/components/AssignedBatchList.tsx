import { useFetcher, useLoaderData } from "@remix-run/react";
function AssignedBatchList({ user }: any) {
  const { groups } = useLoaderData();
  const userfetcher = useFetcher();
  let removeBatch = (e) => {
    if (groups[e].rejected) {
      alert(
        "group contain rejected data, contact the annotator to either ignore or accept!"
      );
      return null;
    }
    let c = confirm("Are you sure you want to remove this group from user?");

    if (c)
      userfetcher.submit(
        { batch: e, id: user.id },
        {
          method: "DELETE",
        }
      );
  };

  let removing =
    userfetcher.formData?.get("id") === user.id &&
    userfetcher.formMethod === "DELETE";
  let reviewedBatch = user.assigned_batch.filter(
    (item) => groups[item]?.reviewed
  );
  let currentBatch = user.assigned_batch.filter(
    (item) => !groups[item]?.reviewed
  );
  const title = `${reviewedBatch.length ?? 0} completed out of ${
    user.assigned_batch.length
  } batches:{ ${reviewedBatch.join(" , ")} }`;

  return (
    <div className="mt-2 flex gap-2">
      {reviewedBatch.length > 0 && (
        <div
          title={title}
          className="cursor-pointer bg-green-300 rounded  px-2 py-1"
        >
          {reviewedBatch.length} Completed
        </div>
      )}
      {currentBatch.map((item) => {
        return (
          <span
            className=" text-black  mr-1 cursor-pointer p-1 border-2 rounded border-gray-300"
            onClick={() => removeBatch(item)}
            key={item}
            style={{
              background: groups[item]?.reviewed
                ? "lightgreen"
                : groups[item]?.approved
                ? "lightblue"
                : groups[item]?.rejected
                ? "pink"
                : "white",
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

export default AssignedBatchList;
