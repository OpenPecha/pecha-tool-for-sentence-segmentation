import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import truncateText from "~/lib/truncate";
function Sidebar({ user, online }) {
  let data = useLoaderData();
  let text = data.text;
  let [openMenu, setOpenMenu] = useState(false);
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
                  {truncateText(text.modified_text, 40)} <Tick />
                </Link>
              );
            })}
            {user?.rejected_list.map((text) => {
              return (
                <Link
                  to={`/?session=${user.username}&history=${text.id}`}
                  key={text?.id}
                  className="history-item"
                  onClick={() => setOpenMenu(false)}
                >
                  {truncateText(text.original_text, 40)} <Cross />
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

function Tick() {
  return (
    <svg
      aria-hidden="true"
      className="tickSVG"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <path d="M9 16.172l10.594-10.594 1.406 1.406-12 12-5.578-5.578 1.406-1.406z"></path>
    </svg>
  );
}
function Cross() {
  return (
    <svg
      aria-hidden="true"
      className="crossSVG"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <path d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z"></path>
    </svg>
  );
}
