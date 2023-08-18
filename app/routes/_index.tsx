import {
  redirect,
  type LoaderFunction,
  type V2_MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Button from "~/components/Button";
import Editor from "~/components/Editor.client";
import Sidebar from "~/components/Sidebar";
import { getTextToDisplay, getTextToDisplayByUser } from "~/model/text";

import { Divider } from "~/tiptapProps/extension/divider";
import { Character } from "~/tiptapProps/extension/character";
import { editorProps } from "~/tiptapProps/events";
import checkUnknown from "~/lib/checkUnknown";
import { createUserIfNotExists } from "~/model/user";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { ClientOnly } from "remix-utils";
import { Sentence } from "~/tiptapProps/extension/sentence";
import { NEW_LINER } from "~/constant";

export const loader: LoaderFunction = async ({ request }) => {
  let { KEY, CLUSTER, APP_ID, SECRET, NODE_ENV } = process.env;
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
    if (user.allow_annotation) text = await getTextToDisplay(user, history);
    let textFromUser = await getTextToDisplayByUser(user?.id);
    return { text, textFromUser, user, KEY, CLUSTER, NODE_ENV };
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
  const setter = () => {};
  const charClick = () => {};
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Divider(setter),
        Character(charClick),
        Sentence(setter),
      ],
      content: newText,
      editorProps,
      editable: false,
    },
    [newText]
  );
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
        {!data.text ? (
          <div>
            Thank you . your work is complete ! 😊😊😊 Check if there is any
            rejected text in history
          </div>
        ) : (
          <div className="fixed bottom-[150px] md:top-[-80px] md:relative  max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            <div className="label mb-2 shadow-lg">Text</div>
            <ClientOnly fallback={null}>
              {() => (
                <div className=" max-h-[50vh] p-2 overflow-y-scroll shadow-md text-xl max-w-full mx-auto">
                  <Editor editor={editor!} />
                </div>
              )}
            </ClientOnly>
            {!editor && <div>loading...</div>}
          </div>
        )}
        <ClientOnly fallback={null}>
          {() => (
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
          )}
        </ClientOnly>
      </div>
    </div>
  );
}
