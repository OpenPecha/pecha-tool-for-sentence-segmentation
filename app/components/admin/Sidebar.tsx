import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLoaderData, useLocation } from "@remix-run/react";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { toolname } from "~/const";
import { BiSolidDashboard } from "react-icons/bi/index.js";
import { Cross, Hamburger } from "../../assets/svgs";
import { FiUsers } from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}
function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const sidebar = useRef<any>(null);
  const trigger = useRef<any>(null);
  let { pathname } = useLocation();
  const { user } = useLoaderData();
  let url = "/?session=" + user?.username;
  return (
    <aside
      ref={sidebar}
      className={` absolute left-0 top-0 z-10 flex h-screen w-72.5 flex-col overflow-y-hidden text-white bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to={url}>
          <h3 className="mb-2 text-2xl pt-4 font-semibold text-bodydark2 capitalize">
            {toolname}
          </h3>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
<Hamburger />
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-2 lg:mt-9 ">
          <div className="text-xl">
            <NavLink
              to={`/admin/metabase?session=${user.username}`}
              className={`group relative flex mb-3 items-center gap-2.5 rounded-sm py-2  font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                pathname.includes("metabase") && "bg-slate-600 dark:bg-meta-4 "
              }`}
            >
              <BiSolidDashboard />
              Dashboard
            </NavLink>
            <h3 className="mb-4 text-sm font-semibold text-gray-400">MENU</h3>

            <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
              <li>
                <NavLink
                  to={"/admin/user?session=" + user.username}
                  className={({ isActive }) =>
                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                    (isActive && "!text-white bg-slate-600 dark:bg-meta-4")
                  }
                >
                  <FiUsers /> User
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"/admin/text?session=" + user.username}
                  className={({ isActive }) =>
                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                    (isActive && "!text-white  bg-slate-600 dark:bg-meta-4")
                  }
                >
                  <AiOutlineFileText /> Text
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={"/admin/report?session=" + user.username}
                  className={({ isActive }) =>
                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                    (isActive && "!text-white  bg-slate-600 dark:bg-meta-4")
                  }
                >
                  <AiOutlineFileText /> Report
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
