import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";
import { historyText } from "./Sidebar";
import TextInfo from "./TextInfo";
import { AdminHistoryItem } from "./History";
import { sortUpdate_reviewed } from "~/lib/sortReviewedUpdate";
import { Hamburger, Tick } from "../assets/svgs";
import { useSocket } from "./contexts/SocketContext";
import { toolname } from "~/const";

interface SidebarProps {
  user: any;
  setSelectedId: (data: number | undefined) => void;
  selectedId: number | undefined;
}

function AdminHistorySidebar({
  user,
  setSelectedId,
  selectedId,
}: SidebarProps) {
  const data = useLoaderData();
  const socket = useSocket();
  const [openMenu, setOpenMenu] = useState(false);
  const reval = useRevalidator();

  useEffect(() => {
    if (!socket) return;
    socket.on("text-status-changed", (data) => {
      reval.revalidate();
    });
  }, [socket]);
  const SidebarHeader = () => (
    <div className="flex bg-[#384451] px-2 py-3 items-center justify-between md:hidden">
      <Link to={`/admin?session=${data.user.username}`}>
        <div className="cursor-pointer">{toolname}</div>
      </Link>
      <div className="close" onClick={() => setOpenMenu(false)}>
        x
      </div>
    </div>
  );
  return (
    <div className="flex flex-col">
      <div
        className="flex px-2 py-3 text-white bg-gray-600 text-lg font-semibold items-center  gap-2 "
        onClick={() => setOpenMenu(true)}
      >
        <Hamburger />
        <Link
          to={`/admin/metabase?session=${data.user.username}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {toolname}
        </Link>
      </div>
      <div
        className={`flex flex-col text-white bg-[#54606e] overflow-y-auto overflow-x-hidden max-h-[100vh] transition-all -translate-x-full z-30 ${
          openMenu ? "block translate-x-0" : ""
        } min-h-[100vh] w-[260px] md:translate-x-0`}
      >
        <div className="px-2 flex gap-2 flex-col border-b-2 border-b-[#384451] mb-3 pb-2 mt-2 ">
          <SidebarHeader />
          <Link
            to={`/admin/user?session=${data?.user.username}`}
            className="decoration-0 text-white bg-gray-500 h-fit px-2 py-1 "
          >
            DASHBOARD
          </Link>
          <TextInfo>User : {user?.username}</TextInfo>
          <TextInfo>text id :{selectedId}</TextInfo>
          <TextInfo>Approved :{user?.text?.length}</TextInfo>
          <TextInfo>Rejected :{user?.rejected_list?.length}</TextInfo>
          <TextInfo>
            Reviewed : {user?.text.filter((r) => r.reviewed)?.length}
          </TextInfo>
        </div>
        <div className="flex-1">
          <div className="text-sm mb-2 font-bold">History</div>
          <div className="flex flex-col gap-2 max-h-fit overflow-y-auto">
            {user &&
              user?.text?.sort(sortUpdate_reviewed).map((text: historyText) => (
                <AdminHistoryItem
                  id={text?.id}
                  key={text.id + "-accepted"}
                  onClick={() => {
                    setOpenMenu(false);
                    setSelectedId(text?.id);
                  }}
                  icon={<Tick />}
                  reviewed={text?.reviewed!}
                  selectedId={selectedId!}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHistorySidebar;
