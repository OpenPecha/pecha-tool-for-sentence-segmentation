import { LoaderFunction } from "@remix-run/node";
import React from "react";
import { getTask } from "./owner/data";
import {
  Link,
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from "@remix-run/react";
import { formatDate } from "./owner.$username";

export const loader: LoaderFunction = async ({ request, params }) => {
  let taskId = params.taskId;
  let task = await getTask(taskId);
  let url = new URL(request.url);
  let session = url.searchParams.get("session");

  return { task, session };
};

function Task() {
  let { task, session } = useLoaderData();
  let { user } = useOutletContext();
  const NEW_LINER = "↩️";
  // Correctly parsing and preparing text for display with new lines
  let modifiedText = JSON.parse(task.modified_text)
    ?.join(NEW_LINER)
    ?.split(NEW_LINER)
    ?.map((line, index) => (
      <span key={index}>
        {line} {NEW_LINER}
        <br />
      </span>
    ));
  let reviewedText = JSON.parse(task.reviewed_text)
    ?.join(NEW_LINER)
    ?.split(NEW_LINER)
    ?.map((line, index) => (
      <span key={index}>
        {line} {NEW_LINER}
        <br />
      </span>
    ));

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <Link
            to={`/owner/${user}?session=${session}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2 justify-between overflow-auto">
            <div
              className="flex flex-1 flex-col bg-gray-100 rounded p-3 shadow space-y-2"
              style={{ maxHeight: "30vh", overflowY: "auto" }}
            >
              <p>
                <strong>Text:</strong> {task.original_text}
              </p>
            </div>
            <div
              className="flex flex-1 flex-col bg-gray-100 rounded p-3 shadow space-y-2"
              style={{ maxHeight: "30vh", overflowY: "auto" }}
            >
              <p>
                <strong>Modified:</strong> {modifiedText}
              </p>
            </div>
            <div
              className="flex flex-1 flex-col bg-gray-100 rounded p-3 shadow space-y-2"
              style={{ maxHeight: "30vh", overflowY: "auto" }}
            >
              <p>
                <strong>Reviewed:</strong> {reviewedText}
              </p>
            </div>
          </div>
          <p>
            <strong>Date & Time:</strong> {formatDate(task.modified_on)}
          </p>
          <p>
            <strong>Word Count:</strong> {task.word_count}
          </p>
          <p>
            <strong>Status:</strong> {task.reviewed ? "Reviewed" : "Pending"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Task;
