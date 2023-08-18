import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Cross, Hamburger, Tick } from "./SVGS";
import { Role, Text } from "@prisma/client";
import { error_and_pay } from "~/lib/payCalc";
import TextInfo from "./TextInfo";
import { sortUpdate_reviewed } from "~/lib/sortReviewedUpdate";
import HistoryItem from "./History";

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
  let role = user.role;
  const SidebarHeader = () => (
    <div className="sidebar-Header">
      <div className="title">Sentence segmentation</div>
      <div className="close" onClick={() => setOpenMenu(false)}>
        x
      </div>
    </div>
  );

  const originalArray = [
    ...(user?.rejected_list || []),
    ...(user?.approved_text || []),
    ...(user?.reviewed_list || []),
  ];

  const mergedArray = [];
  const seen = new Set();
  let { finalErrorCount, pay } = error_and_pay(user);
  originalArray.forEach((item, index) => {
    if (item.id.startsWith("a_") || item.id.startsWith("b_")) {
      const matchingItem = originalArray.find(
        (x, innerIndex) =>
          innerIndex !== index && x.id.substring(2) === item.id.substring(2)
      );
      if (matchingItem && !seen.has(item.id.substring(2))) {
        mergedArray.push({
          ...item,
          id: "c_" + item.id.substring(2),
        });
        seen.add(item.id.substring(2));
      }
    } else {
      mergedArray.push(item);
    }
  });

  return (
    <div className="flex flex-col">
      <div
        className="flex px-2 py-3 text-white bg-gray-600 text-lg font-semibold items-center  gap-2"
        onClick={() => setOpenMenu(true)}
      >
        <Hamburger />
        Sentence segmentation
      </div>
      <div
        className={`flex flex-col text-white bg-[#54606e] overflow-y-auto overflow-x-hidden max-h-[100vh] transition-all -translate-x-full z-30 ${
          openMenu ? "block translate-x-0" : ""
        } min-h-[100vh] w-[260px] md:translate-x-0`}
      >
        <div className="px-2 flex gap-2 flex-col border-b-2 border-b-[#384451] mb-3 pb-2 mt-2 ">
          <SidebarHeader />
          {user.role === "admin" && (
            <Link
              to={`/admin?session=${user?.username}`}
              className="text-white bg-gray-500 p-3 decoration-inherit"
            >
              Admin
            </Link>
          )}
          {user.role === "reviewer" && (
            <Link
              to={`/dashboard?session=${user?.username}`}
              className="text-white bg-gray-500 p-3 decoration-inherit"
            >
              Dashboard
            </Link>
          )}
          <TextInfo>User : {user?.username}</TextInfo>
          <TextInfo>
            text id :{ga ? ga.id.replace("a_", "") : text?.id}
          </TextInfo>
          <TextInfo>batch id :{!text?.batch ? batch : text?.batch}</TextInfo>
          <TextInfo>Approved :{user?.approved_text?.length}</TextInfo>
          <TextInfo>Rejected :{user?.rejected_list?.length}</TextInfo>
          <TextInfo>error : {finalErrorCount} %</TextInfo>
          <TextInfo>earn : Rs {pay}</TextInfo>
        </div>
        <div className="flex-1">
          <div className="text-sm mb-2 font-bold">History</div>
          <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
            {role === "annotator" &&
              ([...user?.rejected_list] || [])
                .sort(sortUpdate_reviewed)
                .map((text: Text) => (
                  <HistoryItem
                    user={user}
                    id={text?.id}
                    key={text.id + "-accepted"}
                    onClick={() => setOpenMenu(false)}
                    icon={text?.modified_text ? <Tick /> : <Cross />}
                    reviewer={reviewer}
                  />
                ))}
            {role === "annotator" &&
              ([...user?.approved_text] || [])
                .sort(sortUpdate_reviewed)
                .map((text: Text) => (
                  <HistoryItem
                    user={user}
                    id={text?.id}
                    key={text.id + "-accepted"}
                    onClick={() => setOpenMenu(false)}
                    icon={text?.modified_text ? <Tick /> : <Cross />}
                    reviewer={reviewer}
                    disabled={!!text?.reviewed_text}
                  />
                ))}

            {role === "reviewer" &&
              mergedArray
                ?.sort(sortUpdate_reviewed)
                .map((text: Text) => (
                  <HistoryItem
                    user={user}
                    id={text?.id}
                    key={text.id + "-accepted"}
                    onClick={() => setOpenMenu(false)}
                    icon={text?.modified_text ? <Tick /> : <Cross />}
                    reviewer={reviewer}
                    disabled={!!text?.reviewed_text}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
