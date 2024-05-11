import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import TextInfo from "./TextInfo";
import { HistoryItem } from "./History";
import { Cross, Crossburger, Hamburger, Tick } from "../assets/svgs";
import type { User, Text } from "@prisma/client";
import { toolname } from "~/const";

export type historyText = {
  id: number;
  reviewed: boolean;
};
type userType = {
  user: User & { text: any[]; rejected_list: any[] };
  text: Text;
};

function Sidebar({ user, text }: userType) {
  let { monthlyData } = useLoaderData();
  let [openMenu, setOpenMenu] = useState(false);
  let unreviewed_list = user?.text?.filter((r) => !r.reviewed);
  return (
    <div className="flex flex-col">
      <div className=" flex px-2 py-3 text-white bg-gray-600 text-lg font-semibold items-center  gap-2 ">
        <div onClick={() => setOpenMenu((p) => !p)} className="block md:hidden">
          {!openMenu ? <Hamburger /> : <Crossburger />}
        </div>
        {toolname}
      </div>
      <div
        className={`flex flex-col text-white bg-[#54606e] overflow-y-auto overflow-x-hidden max-h-[100vh] transition-all -translate-x-full z-30 ${
          openMenu ? "block translate-x-0" : ""
        } min-h-[100vh] w-[260px] md:translate-x-0`}
      >
        <div className="px-2 flex gap-2 flex-col border-b-2 border-b-[#384451] mb-3 pb-2 mt-2 ">
          {(user?.role === "ADMIN" || user?.role === "REVIEWER") && (
            <Link
              to={`/admin/user?session=${user?.username}`}
              className="decoration-0 text-white bg-gray-500 h-fit px-2 py-1 rounded-sm"
            >
              {user?.role} DASHBOARD
            </Link>
          )}
          <TextInfo>User : {user?.username.split("@")[0]}</TextInfo>
          <TextInfo>text id :{text?.id}</TextInfo>
          <TextInfo>Approved : {user?.text?.length}</TextInfo>
          <TextInfo>Rejected :{user?.rejected_list?.length}</TextInfo>
          <TextInfo>
            Reviewed : {user?.text?.filter((r) => r.reviewed)?.length}
          </TextInfo>
        </div>
        <div className="dropdown dropdown-bottom">
          <div tabIndex={0} role="button" className="btn m-1">
            Show monthly wordcount
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-black"
          >
            {Object.entries(monthlyData).map(([month, wordCount]) => (
              <li key={month}>
                <strong>
                  {month}: {wordCount}
                </strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="text-sm mb-2 ml-2 font-bold">History</div>
          <div className="flex flex-col gap-2 max-h-fit overflow-y-auto pl-2">
            {user?.rejected_list?.map((text: historyText) => (
              <HistoryItem
                user={user}
                id={text?.id}
                key={text.id + "-rejected"}
                onClick={() => setOpenMenu(false)}
                icon={<Cross />}
                currentId={29}
              />
            ))}

            {unreviewed_list.map((text: historyText) => (
              <HistoryItem
                user={user}
                id={text?.id}
                key={text.id + "-accepted"}
                onClick={() => setOpenMenu(false)}
                disabled={text?.reviewed}
                currentId={29}
                icon={
                  <div className="flex items-center justify-between flex-1">
                    <Tick />
                    {text?.reviewed && <span>reviewed</span>}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
