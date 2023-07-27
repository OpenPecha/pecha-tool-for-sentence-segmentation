import {
  redirect,
  type LinksFunction,
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
import globalStyle from "~/styles/global.css";
import { Divider } from "~/tiptapProps/extension/divider";
import { Character } from "~/tiptapProps/extension/character";
import { editorProps } from "~/tiptapProps/events";
import checkUnknown from "~/lib/checkUnknown";
import { createUserIfNotExists } from "~/model/user";
import usePusherPresence from "~/lib/usePresence";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { ClientOnly } from "remix-utils";
import { getter } from "~/service/pusher.server";
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
    let activeText = await getter(APP_ID!, KEY!, SECRET!, CLUSTER!);
    let text = await getTextToDisplay(user?.id, history);
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
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStyle }];
};
export default function Index() {
  let fetcher = useFetcher();
  const data = useLoaderData();
  let text = data?.text?.original_text?.trim();

  const { textOnline } = usePusherPresence(
    `presence-sentence-${data.NODE_ENV}`,
    data?.KEY,
    data?.CLUSTER,
    data?.user,
    data?.text
  );
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
    let text = editor!.getText();
    const escapedSymbol = NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSymbol, "g");
    let modified_text = text.replace(regex, "");

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
  let ignoreTask = async () => {
    let id = data.text.id;
    fetcher.submit(
      { id, userId: user.id, _action: "ignore" },
      { method: "PATCH", action: "/api/text" }
    );
  };
  let rejectTask = async () => {
    let id = data.text.id;
    fetcher.submit(
      { id, userId: user.id, _action: "reject" },
      { method: "PATCH", action: "/api/text" }
    );
  };
  let isButtonDisabled = !editor || !data.text;
  if (data.error) return <div>{data.error}</div>;
  return (
    <div className="main">
      <Sidebar user={data.user} online={textOnline} />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {!data.text ? (
          <div>Thank you . your work is complete ! 😊😊😊</div>
        ) : (
          <div className="container">
            <div className="label">transcript</div>
            <ClientOnly fallback={null}>
              {() => <Editor editor={editor!} />}
            </ClientOnly>
            {!editor && <div>loading...</div>}
          </div>
        )}
        <ClientOnly fallback={null}>
          {() => (
            <div className="btn-container">
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
                handleClick={ignoreTask}
                value="IGNORE"
                title="IGNORE (i)"
                shortCut="i"
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
        </ClientOnly>
      </div>
    </div>
  );
}
