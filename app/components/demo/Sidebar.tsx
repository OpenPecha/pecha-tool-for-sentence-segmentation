import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { sortUpdate_reviewed } from "~/lib/sortReviewedUpdate";
import { Cross, Hamburger, Tick } from "../../assets/svgs";
import TextInfo from "../TextInfo";
import { DemoHistoryItem } from "../History";
import { toolname } from "~/const";

export type historyText = {
  id: number;
  reviewed: boolean;
};

function Sidebar({ user, text, setHistory }) {
  let [openMenu, setOpenMenu] = useState(false);

  function SidebarHeader() {
    return (
      <div className="flex bg-[#384451] px-2 py-3 items-center justify-between md:hidden ">
        <div>About</div>
        <div className="cursor-pointer p-2" onClick={() => setOpenMenu(false)}>
          x
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div
        className=" flex px-2 py-3 text-white bg-gray-600 text-lg font-semibold items-center  gap-2 "
        onClick={() => setOpenMenu(true)}
      >
        <Hamburger />
        {toolname}
      </div>
      <div
        className={`flex flex-col text-white bg-[#54606e] overflow-y-auto overflow-x-hidden max-h-[100vh] transition-all -translate-x-full z-30 ${
          openMenu ? "block translate-x-0" : ""
        } min-h-[100vh] w-[260px] md:translate-x-0`}
      >
        <div className="px-2 flex gap-2 flex-col border-b-2 border-b-[#384451] mb-3 pb-2 mt-2 ">
          <SidebarHeader />
          <TextInfo>User : {user?.username}</TextInfo>
          <TextInfo>text id :{text?.id}</TextInfo>
          <TextInfo>Batch : {text?.batch}</TextInfo>
          <TextInfo>Approved : {user?.text?.length}</TextInfo>
          <TextInfo>Rejected :{user?.rejected_list?.length}</TextInfo>
          <TextInfo>Ignored : {user?.ignored_list?.length}</TextInfo>
          <TextInfo>
            Reviewed : {user?.text.filter((r) => r.reviewed)?.length}
          </TextInfo>
        </div>
        <div className="flex-1">
          <div className="text-sm mb-2 font-bold">History</div>
          <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
            {user &&
              (user.rejected_list || user.text) &&
              (user?.rejected_list || [])
                .sort(sortUpdate_reviewed)
                .map((text: historyText) => (
                  <DemoHistoryItem
                    user={user}
                    id={text?.id}
                    key={text.id + "-accepted"}
                    onClick={() => {
                      setOpenMenu(false);
                      setHistory(text.id);
                    }}
                    icon={<Cross />}
                  />
                ))}
            {(user?.text || [])
              .sort(sortUpdate_reviewed)
              .map((text: historyText) => (
                <DemoHistoryItem
                  user={user}
                  id={text?.id}
                  key={text.id + "-rejected"}
                  onClick={() => {
                    setOpenMenu(false);
                    setHistory(text.id);
                  }}
                  disabled={text?.reviewed}
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
