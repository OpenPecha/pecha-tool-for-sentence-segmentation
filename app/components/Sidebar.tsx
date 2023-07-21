import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import truncateText from "~/lib/truncate";
import { Cross, Hamburger, Tick } from "./SVGS";
import { Text, User } from "@prisma/client";

interface sidebarProps {
  user: any;
  online: any[];
}

function Sidebar({ user, online }: sidebarProps) {
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
          <div className="sidebar-section-title">Sentense segmentation</div>
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
            {user?.text.map((text: Text) => {
              return (
                <History
                  content={text?.modified_text}
                  user={user}
                  id={text?.id}
                  key={text.id}
                  onClick={() => setOpenMenu(false)}
                />
              );
            })}
            {user?.rejected_list.map((text: Text) => {
              return (
                <History
                  content={text?.original_text}
                  user={user}
                  id={text.id}
                  key={text.id}
                  onClick={() => setOpenMenu(false)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

function History({ content, id, user, onClick }: any) {
  return (
    <Link
      to={`/?session=${user.username}&history=${id}`}
      className="history-item"
      onClick={onClick}
    >
      {truncateText(content, 40)} <Tick />
    </Link>
  );
}
