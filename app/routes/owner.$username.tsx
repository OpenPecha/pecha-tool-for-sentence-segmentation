import { LinksFunction, LoaderFunction, defer } from "@remix-run/node";
import {
  Await,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  getNumberOfReviewedTask,
  getNumberOfTask,
  getTaskOfUser,
  getTotalWordCount,
  getUser,
} from "./owner/data";
import { Suspense, useState } from "react";
import { PaginationBar } from "./owner/Component/Pagination";
import DateRangePicker from "~/components/DateRangePicker";
import style1 from "react-datepicker/dist/react-datepicker.css"; // main style file

const PER_PAGE_TEXT_COUNT = 20;
export const links: LinksFunction = () => [{ rel: "stylesheet", href: style1 }];

export const loader: LoaderFunction = async ({ request, params }) => {
  let username = params.username;

  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let startDate =
    url.searchParams.get("startDate") ??
    new Date(new Date().setMonth(new Date().getMonth() - 1));
  let endDate = url.searchParams.get("endDate") ?? new Date(Date.now());

  if (!username) return {};
  let user = await getUser(username);
  let textcount = await getNumberOfTask(username);
  let reviewedTextCount = await getNumberOfReviewedTask(username);
  let take = PER_PAGE_TEXT_COUNT;
  let skip = url.searchParams.get("$skip") ?? "0";
  let tasks = getTaskOfUser(username, take, parseInt(skip), startDate, endDate);
  let totalWordCount = await getTotalWordCount(username, startDate, endDate);
  return defer({
    user,
    textcount,
    reviewedTextCount,
    tasks,
    session,
    totalWordCount: totalWordCount._sum.word_count,
  });
};
export function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function EachUser() {
  let { user, textcount, reviewedTextCount, tasks, session, totalWordCount } =
    useLoaderData();
  console.log(tasks);
  const [searchParams, setSearchParams] = useSearchParams();
  let startDate =
    searchParams.get("startDate") ||
    new Date(new Date().setMonth(new Date().getMonth() - 1));
  let endDate = searchParams.get("endDate") || new Date(Date.now());
  function truncateString(str, num) {
    if (str.length > num) {
      return str.substring(0, num) + "...";
    } else {
      return str;
    }
  }
  function handleSelect(ranges) {
    setSearchParams((p) => {
      p.set("startDate", ranges?.startDate);
      p.set("endDate", ranges?.endDate);
      return p;
    });
  }
  let navigate = useNavigate();

  function goto(url) {
    navigate(url);
  }
  return (
    <>
      <div className="flex-1 mx-3 px-3 flex flex-col  overflow-auto py-2">
        <div className="flex justify-between">
          <PaginationBar total={textcount} />
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleSelect}
          />
        </div>
        <Suspense fallback={<Spinner />}>
          <Await
            resolve={tasks}
            errorElement={<p>Error loading package location!</p>}
          >
            {(tasks_list) => (
              <>
                {Object.keys(tasks_list).length === 0 ? (
                  <div>no task available</div>
                ) : (
                  <>
                    <div className="w-full h-11 p-2.5  justify-center items-center gap-28 inline-flex">
                      <div className="text-center text-black text-base font-normal font-['Inter'] leading-normal">
                        Name: {user.username}
                      </div>
                      <div className="text-center text-black text-base font-normal font-['Inter'] leading-normal">
                        Role : {user.role}
                      </div>
                      <div className="text-center text-black text-base font-normal font-['Inter'] leading-normal">
                        Task : {textcount}
                      </div>
                      <div className="text-center text-black text-base font-normal font-['Inter'] leading-normal">
                        Reviewed task : {reviewedTextCount}
                      </div>
                      <div className="text-center text-black text-base font-normal font-['Inter'] leading-normal">
                        Total word count : {totalWordCount}
                      </div>
                    </div>
                    <div className=" max-h-[60vh] overflow-x-auto relative shadow-md sm:rounded-lg  ">
                      <table className=" w-full max-h-full  text-sm text-left text-gray-500 dark:text-gray-400  ">
                        <thead className="text-xs sticky top-0 text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="py-3 px-6">
                              Task
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Date & Time
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Word Count
                            </th>
                            <th scope="col" className="py-3 px-6">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks_list?.map((task, index) => (
                            <tr
                              key={index + "fe"}
                              onClick={() =>
                                goto(
                                  `/owner/${user.username}/${task.id}?session=${session}`
                                )
                              }
                              className="bg-white cursor-pointer border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 hover:text-white"
                            >
                              <td className="py-4 px-6">
                                {truncateString(task.original_text, 30)}
                              </td>
                              <td className="py-4 px-6">
                                {formatDate(task.modified_on)}
                              </td>
                              <td className="py-4 px-6">{task.word_count}</td>
                              <td className="py-4 px-6">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    task.reviewed === true
                                      ? "bg-green-100 text-green-800"
                                      : task.reviewed === false
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {task.reviewed ? "true" : "false"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Outlet context={{ user: user.username }} />
                  </>
                )}
              </>
            )}
          </Await>
        </Suspense>
      </div>
    </>
  );
}

export default EachUser;

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};
