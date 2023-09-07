import {
  redirect,
  type LinksFunction,
  type LoaderFunction,
  type V2_MetaFunction,
} from "@remix-run/node";
import { useEffect, useRef } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import Button from "~/components/Button";
import Editor from "~/components/Editor.client";
import Sidebar from "~/components/Sidebar";
import { getTextToDisplay } from "~/model/server.text";
import checkUnknown from "~/lib/checkUnknown";
import { createUserIfNotExists } from "~/model/server.user";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { ClientOnly } from "remix-utils";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";
import { useSocket } from "~/components/contexts/SocketContext";
import formatTime from "~/lib/formatTime";
export const loader: LoaderFunction = async ({ request }) => {
  let { NODE_ENV } = process.env;
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let history = url.searchParams.get("history") || null;
  if (!session) {
    return redirect("https://pecha.tools");
  } else {
    let user = await createUserIfNotExists(session);
    let text = null;
    if (user.allow_assign) {
      text = await getTextToDisplay(user?.id, history);
    }
    let current_time = Date.now();
    return { text, user, NODE_ENV, history, current_time };
  }
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Pecha Tools" },
    { name: "description", content: "Word segmentation" },
    {
      keywords:
        "pecha,tools,word,segmentation,pecha tools,pecha tools word segmentation",
    },
  ];
};
export default function Index() {
  let fetcher = useFetcher();
  const data = useLoaderData();
  const text = data?.text?.original_text.trim() || "";
  let user = data.user;
  let editor = useEditorTiptap(text);
  const socket = useSocket();
  const revalidate = useRevalidator();

  useEffect(() => {
    if (!socket) return;
    socket.on("change-allow", (data) => {
      if (data.user.id === user.id) revalidate.revalidate();
    });
    socket.on("reviewed", (data) => {
      if (data.user.id === user.id) revalidate.revalidate();
    });
  }, [socket]);

  let saveText = async () => {
    let endTime = Date.now();
    let timeDiff = endTime - data?.current_time;
    let duration = formatTime(timeDiff);
    let modified_text = editor!.getText();
    let id = data.text.id;
    fetcher.submit(
      { id, modified_text, userId: user.id, duration },
      { method: "POST", action: "/api/text" }
    );
    socket?.emit("text-status-changed", { user });
  };
  let undoTask = async () => {
    let text = checkUnknown(insertHTMLonText(data?.text?.original_text));
    editor?.commands.setContent(text);
  };

  let rejectTask = async () => {
    let id = data.text.id;
    fetcher.submit(
      { id, userId: user.id, _action: "reject" },
      { method: "PATCH", action: "/api/text" }
    );
    socket?.emit("text-status-changed", { user });
  };

  let isButtonDisabled = !data.text || data.text.reviewed;

  if (data.error) return <div>{data.error}</div>;
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar user={data.user} text={data.text} />

      <div className="flex-1 flex items-center flex-col md:mt-[10vh] ">
        {data.user?.rejected_list?.length > 0 && (
          <div className="text-red-500 flex items-center gap-2 font-bold">
            <img
              src="/assets/notification.gif"
              alt="notification "
              className="w-8 h-8"
            />
            SOME OF YOUR WORK IS REJECTED
          </div>
        )}
        {!data.text ? (
          <div className="fixed top-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm text-center py-4">
            {!user.allow_assign && (
              <div className="font-bold first-letter:uppercase first-letter:text-red-400">
                A single work must have been rejected 3 times or more . please
                contact admin .
              </div>
            )}
            Thank you . your work is complete ! 😊😊😊
            <br />
          </div>
        ) : (
          <div className="fixed bottom-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            <div className="flex items-center justify-between opacity-75 text-sm font-bold px-2 capitalize pt-1 ">
              <div>transcript</div>
            </div>
            <ClientOnly fallback={null}>
              {() => <Editor editor={editor!} />}
            </ClientOnly>
            {!editor && <div>loading...</div>}
          </div>
        )}
        {data.text && (
          <div className="flex gap-2 fixed bottom-0 justify-center ">
            <Button
              disabled={isButtonDisabled}
              handleClick={saveText}
              value="CONFIRM"
              title="CONFIRM (a)"
              shortCut="a"
            />
            <Button
              disabled={isButtonDisabled}
              handleClick={rejectTask}
              value="REJECT"
              title="REJECT (x)"
              shortCut="x"
            />

            <Button
              disabled={isButtonDisabled}
              handleClick={undoTask}
              value="UNDO"
              title="UNDO (backspace)"
              shortCut="Backspace"
            />
          </div>
        )}
      </div>
    </div>
  );
}
