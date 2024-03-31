import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/service/db.server";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import style1 from "react-datepicker/dist/react-datepicker.css"; // main style file
import { LinksFunction } from "@remix-run/node";
import useModal from "~/components/hooks/useModal";
import DateRangePicker from "~/components/DateRangePicker";
ChartJS.register(ArcElement, Tooltip, Legend);

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: style1 },
];

export const loader = async ({ request }) => {
  let url = new URL(request.url);
  let reviewer = url.searchParams.get("reviewer");
  let startDate = url.searchParams.get("startDate");
  let endDate = url.searchParams.get("endDate");

  const [users, reviewers] = await Promise.all([
    db.user.findMany({
      where: {
        reviewer:
          reviewer === "all"
            ? undefined
            : reviewer
            ? { username: reviewer }
            : undefined,
      },
      select: {
        username: true,
        nickname: true,
        text: {
          where: {
            reviewed: true,
            modified_on:
              startDate && endDate
                ? startDate !== endDate
                  ? { gte: new Date(startDate), lte: new Date(endDate) }
                  : new Date(startDate)
                : undefined,
          },
          select: { word_count: true, updatedAt: true, duration: true },
        },
        role: true,
      },
    }),
    db.user.findMany({
      where: { role: "REVIEWER" },
      select: { username: true },
    }),
  ]);

  let usersDetail = users.map((user) => {
    const word_count = user.text.reduce(
      (total, obj) => total + obj.word_count,
      0
    );
    const duration_sec = user.text.reduce((total, obj) => {
      let duration = obj.duration;
      return total + duration;
    }, 0);
    let duration =
      duration_sec > 0
        ? Math.floor(duration_sec / 60).toFixed(2)
        : word_count > 0
        ? 3
        : 0; // in minutes
    let taskCount = user.text.length;
    return {
      username: user.username,
      nickname: user.nickname,
      word_count,
      duration,
      taskCount,
      averageWordCount: (word_count / taskCount).toFixed(2),
    };
  });
  return { usersDetail, reviewers };
};



function report() {
  let { usersDetail, reviewers } = useLoaderData();
  let [params, setParams] = useSearchParams();
  let { Modal, Toggle_Modal, changeOpen } = useModal();
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  function handleReviewerChange(e) {
    setParams((prev) => {
      prev.set("reviewer", e.target.value);
      return prev;
    });
  }
  function downloadReport() {
    const blob = new Blob([JSON.stringify(usersDetail, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    let start_date =
      new Date(range.startDate).getMonth() +
      1 +
      "-" +
      new Date(range.startDate).getDate() +
      "-" +
      new Date(range.startDate).getFullYear();
    let end_date =
      new Date(range.endDate).getMonth() +
      1 +
      "-" +
      new Date(range.endDate).getDate() +
      "-" +
      new Date(range.endDate).getFullYear();
    a.download = `${start_date}-${end_date}.txt`;
    document.body.appendChild(a);
    a.click();

    // Clean up by revoking the Object URL
    URL.revokeObjectURL(url);
  }
  function handleSelect(ranges) {
    setRange(ranges);
  }
  function handleSubmitDate() {
    setParams((prev) => {
      prev.set("startDate", range?.startDate);
      prev.set("endDate", range?.endDate);
      return prev;
    });
    changeOpen();
  }
  function handleReset() {
    setParams((prev) => {
      prev.delete("startDate");
      prev.delete("endDate");
      return prev;
    });
    changeOpen();
  }

  return (
    <div className="mt-3 mx-8">
      <div className="flex justify-between items-center">
        <div>
          <label htmlFor="selectReviewer">Reviewer</label>
          <select
            id="selectReviewer"
            onChange={handleReviewerChange}
            value={params.get("reviewer")! || params.get("session")}
            className="m-6"
          >
            <option value="all">all</option>
            {reviewers.map((user,index) => {
              return (
                <option key={user.nickname+index} value={user.username}>
                  {user.username}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadReport}
            className="bg-green-600 px-2  rounded hover:bg-green-700 text-white"
          >
            download Report
          </button>
          <Toggle_Modal>
            <div className="bg-gray-400 px-2 rounded">Date Range</div>
          </Toggle_Modal>
        </div>
        <Modal>
          <div className="flex flex-col h-[40vh]">
            <DateRangePicker range={range} onChange={handleSelect} />
            <div className="flex flex-col flex-1  gap-3">
              <button
                className="ml-4 btn-md bg-green-300 rounded w-full hover:bg-green-400"
                onClick={handleSubmitDate}
                type="button"
              >
                submit
              </button>
              <button
                className="ml-4  btn-md bg-red-300 rounded w-full"
                onClick={handleReset}
                type="button"
              >
                reset
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <div className="divider"></div>
      <div className="flex">
        <div className="flex flex-1 gap-3 flex-wrap">
          {usersDetail.map((user) => {
            return (
              <div
                key={user.username}
                className=" flex flex-col bg-gray-200 p-2 capitalize px-10 hover:bg-gray-300 cursor-pointer"
              >
                <span className="font-bold text-xl mb-2">{user.nickname}</span>
                <div className="flex gap-3">
                  <div>
                    <div>Task: {user.taskCount}</div>
                    <div title="space count">Word: {user.word_count}</div>
                    <div>average word per task: {user.averageWordCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default report;
