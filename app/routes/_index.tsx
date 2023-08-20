import {
  redirect,
  type LoaderFunction,
  type V2_MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getTextToDisplay, getTextToDisplayByUser } from "~/model/text";
import { createUserIfNotExists } from "~/model/user";
import { NEW_LINER } from "~/constant";
import Button from "~/components/Button";
import Editor from "~/components/Editor.client";
import Sidebar from "~/components/Sidebar";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import checkUnknown from "~/lib/checkUnknown";
import { useEditorContainer } from "~/lib/hook/useEditorContainer";

export const loader: LoaderFunction = async ({ request }) => {
  let { NODE_ENV } = process.env;
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let history = url.searchParams.get("history") || null;
  if (!session) {
    return redirect("/error");
  } else {
    let user = await createUserIfNotExists(session);
    if (user.role === "reviewer") {
      return redirect("/reviewer?session=" + session);
    }
    let text = null;
    if (user.allow_annotation && user.categories.length > 0)
      text = await getTextToDisplay(user, history);
    let textFromUser = await getTextToDisplayByUser(user?.id);
    return { text, textFromUser, user, NODE_ENV };
  }
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Pecha Tools" },
    { name: "description", content: "Sentence segmentation" },
  ];
};

export default function Index() {
  let fetcher = useFetcher();
  const data = useLoaderData();
  let text = data?.text?.original_text?.trim();
  let user = data.user;
  let insertHTML = insertHTMLonText(text);
  let newText = checkUnknown(insertHTML);
  const editor = useEditorContainer(newText);

  let saveText = async () => {
    let text = editor?.getText();
    const escapedSymbol = NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSymbol, "g");
    let modified_text = text?.replace(regex, "")!;
    let id = data.text.id;
    fetcher.submit(
      { id, modified_text, userId: user.id },
      { method: "POST", action: "/api/text" }
    );
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
  };
  let isButtonDisabled =
    !editor ||
    !data.text ||
    fetcher.state !== "idle" ||
    data.text.reviewed_text !== null;
  if (data.error) return <div>{data.error}</div>;
  return (
    <div className="flex flex-col md:flex-row overflow-hidden w-screen h-screen">
      <Sidebar user={data.user} reviewer={false} />
      <div className="flex flex-1 justify-around items-center flex-col md:flex-row">
        {!data.text || !editor ? (
          <>
            Thank you . your work is complete ! 😊😊😊 Check if there is any
            rejected text in history
          </>
        ) : (
          <div className="fixed bottom-[150px] md:top-[-80px] md:relative  max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            <div className="label mb-2 shadow-lg">Text</div>
            <div className=" max-h-[50vh] p-2 overflow-y-scroll shadow-md text-xl max-w-full mx-auto">
              <Editor editor={editor} />
            </div>
          </div>
        )}
        <div className="flex gap-2 fixed bottom-0 justify-center">
          <Button
            disabled={isButtonDisabled}
            handleClick={saveText}
            type="CONFIRM"
            title="CONFIRM (a)"
            shortCut="a"
          />
          <Button
            disabled={isButtonDisabled}
            handleClick={rejectTask}
            type="REJECT"
            title="REJECT (x)"
            shortCut="x"
          />
          <Button
            disabled={isButtonDisabled}
            handleClick={undoTask}
            type="UNDO"
            title="UNDO (backspace)"
            shortCut="Backspace"
          />
        </div>
      </div>
    </div>
  );
}
