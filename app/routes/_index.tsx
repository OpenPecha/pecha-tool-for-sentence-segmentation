import {
  redirect,
  type LoaderFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData,  } from "@remix-run/react";
import Button from "~/components/Button";
import Editor from "~/components/Editor";
import Sidebar from "~/components/Sidebar";
import { getTextToDisplay } from "~/model/server.text";
import checkUnknown from "~/lib/checkUnknown";
import { createUserIfNotExists } from "~/model/server.user";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";
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
    if(user?.role==='ADMIN'||user?.role==='REVIEWER'){
      return redirect(`/admin/user/?session=${user.username}`);
    }
    if (user?.allow_assign) {
      text = await getTextToDisplay(user?.id, history);
      if(text?.error){
        return {error:text.error.message}
      }
    }
    let current_time = Date.now();
    return { text, user, NODE_ENV, history, current_time };
  }
};


export default function Index(){
  let {text,user,current_time,error}=useLoaderData();
  let fetcher = useFetcher();
  let textContent = text?.original_text.trim() || "";
  let editor = !error ? useEditorTiptap(textContent):null;


  let saveText = async () => {
    let endTime = Date.now();
    let timeDiff = endTime - current_time;
    let duration = formatTime(timeDiff);
    let modified_text = editor!.getText();
    let id = text.id;
    fetcher.submit(
      { id, modified_text, userId: user.id, duration },
      { method: "POST", action: "/api/text" }
    );
  };
  let undoTask = async () => {
    let newText = checkUnknown(insertHTMLonText(text?.original_text));
    editor?.commands.setContent(newText);
  };
  let rejectTask = async () => {
    let id = text.id;
    fetcher.submit(
      { id, userId: user.id, _action: "reject" },
      { method: "PATCH", action: "/api/text" }
    );
  };
  let isButtonDisabled = !text || text.reviewed;
  


  return  <div className="flex flex-col md:flex-row">
        <Sidebar user={user} text={text} />
  
        <div className="flex-1 flex items-center flex-col md:mt-[10vh] ">
          {user?.rejected_list?.length > 0 && (
            <div className="text-red-500 flex items-center gap-2 font-bold">
              <img
                src="/assets/notification.gif"
                alt="notification "
                className="w-8 h-8"
              />
              YOUR WORK CONTAINS REJECTED TASK
            </div>
          )}
          {error && <div>{error}</div>}
          {!text ? (
            <div className="fixed top-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm text-center py-4">
              {!user?.allow_assign && (
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
               <Editor editor={editor} />
              {!editor && <div>loading...</div>}
            </div>
          )}
          {text && (
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
}
