import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import truncateText from "~/lib/truncate";
import { Cross, Hamburger, Tick } from "./SVGS";
import { Text } from "@prisma/client";

interface HistoryItemProps {
  content: string;
  id: string;
  user: any;
  onClick: () => void;
  icon: JSX.Element;
  reviewer: boolean;
}

function HistoryItem({
  content,
  id,
  user,
  onClick,
  icon,
  reviewer,
}: HistoryItemProps) {
  let split = id.split("_");
  let historyName = split[0] + "_" + split[1] + "_" + split[split.length - 1];
  return (
    <Link
      to={`/${reviewer ? "reviewer" : ""}?session=${
        user.username
      }&history=${id}`}
      className="flex justify-between"
      onClick={onClick}
    >
      {historyName} {icon}
    </Link>
  );
}

interface SidebarProps {
  user: any;
  online: any[];
  reviewer: boolean;
  batch?: string;
  history?: any;
}

function Sidebar({ user, online, reviewer, batch, history }: SidebarProps) {
  const data = useLoaderData();
  const text = data.text;
  const [openMenu, setOpenMenu] = useState(false);
  let ga = data.ga;

  const SidebarHeader = () => (
    <div className="sidebar-Header">
      <div className="title">Sentence segmentation</div>
      <div className="close" onClick={() => setOpenMenu(false)}>
        x
      </div>
    </div>
  );

  return (
    <div className="header">
      <div className="sidebar_title" onClick={() => setOpenMenu(true)}>
        <Hamburger />
        Sentence segmentation
      </div>
      <div className={`sidebar ${openMenu ? "open" : ""}`}>
        <div className="sidebar_menu">
          <SidebarHeader />
          {user.role === "ADMIN" && (
            <Link
              to={`/admin?session=${user?.username}`}
              style={{
                textDecoration: "none",
                color: "white",
                background: "gray",
                padding: 10,
              }}
            >
              Admin
            </Link>
          )}
          <div>
            <span className="info">User :</span> {user?.username}
          </div>
          <div>
            <span className="info">text id :</span>{" "}
            {ga ? ga.id.replace("a_", "") : text?.id}
          </div>
          <div>
            <span className="info">batch id :</span>{" "}
            {!text?.batch ? batch : text?.batch}
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
        <div className="sidebar_menu" style={{ flex: 1 }}>
          <div className="sidebar-section-title">History</div>
          <div className="history-container">
            {user &&
              !history &&
              (user.rejected_list || user.approved_text) &&
              [...(user?.rejected_list || []), ...(user?.approved_text || [])]
                .sort(sortUpdate)
                .map((text: Text) => (
                  <HistoryItem
                    content={text?.modified_text! || text?.original_text}
                    user={user}
                    id={text?.id}
                    key={text.id + "-accepted"}
                    onClick={() => setOpenMenu(false)}
                    icon={text?.modified_text ? <Tick /> : <Cross />}
                    reviewer={reviewer}
                  />
                ))}
            {history && console.log(history)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

function sortUpdate(a: Text, b: Text) {
  const parsedDate1 = new Date(a.updatedAt);
  const parsedDate2 = new Date(b.updatedAt);
  return parsedDate2 - parsedDate1;
}
