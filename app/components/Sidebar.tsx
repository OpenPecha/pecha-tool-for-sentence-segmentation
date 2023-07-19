import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";

function Sidebar({ user, online }) {
  let data = useLoaderData();
  let text = data.text;
  const fetcher = useFetcher();
  let [openMenu, setOpenMenu] = useState(false);
  function resetText(id: string) {
    fetcher.submit({ id }, { method: "DELETE", action: "api/text" });
  }

  return (
    <div className="header">
      <div className="sidebar_title" onClick={() => setOpenMenu(true)}>
        <Hamburger />
        Pecha Tools
      </div>
      <div className={`sidebar ${openMenu ? "open" : ""}`}>
        <div className={`sidebar_menu`}>
          <div className="sidebar-Header">
            <div className="title">Pecha Tools</div>
            <div className="close" onClick={() => setOpenMenu(false)}>
              x
            </div>
          </div>
          <div className="sidebar-section-title">Project Info</div>
          <div>
            <span className="info">User :</span> {user?.username}
          </div>
          <div>
            <span className="info">text id :</span> {text?.id}
          </div>
          <div>
            <span className="info">Approved :</span> {user?.text?.length}
          </div>
          <div>
            <span className="info">Rejected :</span>{" "}
            {user?.rejected_list?.length}
          </div>
          <div>
            <span className="info">Ignored :</span> {user?.ignored_list?.length}
          </div>
          <div>
            <span className="info">online User :</span> {online?.length}
          </div>
        </div>
        <div className="sidebar_menu " style={{ flex: 1 }}>
          <div className="sidebar-section-title">History</div>
          <div className="history-container">
            {user?.text.map((text) => {
              return (
                <Link
                  to={`/?session=${user.username}&history=${text.id}`}
                  key={text?.id}
                  className="history-item"
                  onClick={() => setOpenMenu(false)}
                >
                  {text.modified_text}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

function Hamburger() {
  return (
    <svg
      aria-hidden="true"
      fill="gray"
      width="20"
      height="20"
      viewBox="0 0 24 24"
    >
      <path d="M3 5h18q0.414 0 0.707 0.293t0.293 0.707-0.293 0.707-0.707 0.293h-18q-0.414 0-0.707-0.293t-0.293-0.707 0.293-0.707 0.707-0.293zM3 17h18q0.414 0 0.707 0.293t0.293 0.707-0.293 0.707-0.707 0.293h-18q-0.414 0-0.707-0.293t-0.293-0.707 0.293-0.707 0.707-0.293zM3 11h18q0.414 0 0.707 0.293t0.293 0.707-0.293 0.707-0.707 0.293h-18q-0.414 0-0.707-0.293t-0.293-0.707 0.293-0.707 0.707-0.293z"></path>
    </svg>
  );
}
