import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import Button from "~/components/Button";
import Sidebar from "~/components/demo/Sidebar";
import EditorContainer from "~/components/Editor.client";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/service/db.server";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import useModal from "~/components/hooks/useModal";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let text = await db.text.findMany({
    take: 10,
    select: { original_text: true, id: true },
  });

  return { text };
};

type UserType = {
  username: string;
  role: string;
  text: { id: number; content: string | undefined }[];
  rejected_list: { id: number }[];
  ignored_list: { id: number }[];
};

function DemoPage() {
  const { text } = useLoaderData();
  const [text_Array, setTextArray] = useState(text);
  const [user, setUser] = useState<UserType>({
    username: "demo",
    role: "USER",
    text: [],
    rejected_list: [],
    ignored_list: [],
  });
  const [history, setHistory] = useState(null);
  let content =
    text_Array.find(
      (i: { id: string }) =>
        ![...user.text, ...user.rejected_list].find((j) => j.id == i.id)
    ) || null;
  if (history) {
    content =
      user.text.find((i) => i.id === history) ||
      text_Array.find((i: { id: string }) => i.id == history);
  }
  let original_text = content.content || content?.original_text.trim();
  let insertHTML = insertHTMLonText(original_text);

  const editor = useEditorTiptap(insertHTML);
  const saveText = () => {
    let content_text = editor?.getText();
    if (history) {
      if (user.rejected_list.some((item) => item.id === history)) {
        setUser((prev) => ({
          ...prev,
          rejected_list: prev.rejected_list.filter(
            (item) => item.id != history
          ),
          text: [...prev.text, { id: history, content: content_text }],
        }));
      }
      setHistory(null);
    } else {
      setUser({
        ...user,
        text: [...user.text, { id: content.id, content: content_text }],
      });
      setHistory(null);
    }
  };
  const rejectTask = () => {
    if (history) {
      if (user.text.some((item) => item.id === history)) {
        setUser((prev) => ({
          ...prev,
          text: prev.text.filter((item) => item.id != history),
          rejected_list: [...prev.rejected_list, { id: history }],
        }));
      }
      setHistory(null);
    } else {
      setUser({
        ...user,
        rejected_list: [...user.rejected_list, { id: content.id }],
      });
      setHistory(null);
    }
  };
  const undoTask = () => {
    let text = insertHTMLonText(content.original_text);
    editor?.commands.setContent(text);
  };
  const { Modal, Toggle_Modal } = useModal();
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar user={user} text={text} setHistory={setHistory} />

      <div className="flex-1 flex items-center flex-col md:mt-[10vh] ">
        {!content ? (
          <div>Thank you . your work is complete ! 😊😊😊</div>
        ) : (
          <div className="fixed bottom-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            <div className="flex items-center justify-between opacity-75 text-sm font-bold px-2 capitalize pt-1 ">
              <div>transcript</div>

              <Toggle_Modal className="cursor-pointer">reference</Toggle_Modal>
              <Modal>
                <iframe
                  className="w-full h-[80vh]"
                  src="https://docs.google.com/spreadsheets/d/1ZdkguvvvWiqZoEh4LLbceYsnHubBDpAAdi4DToFN9I0/edit?usp=sharing"
                ></iframe>
              </Modal>
            </div>
            {!editor ? (
              <div>loading...</div>
            ) : (
              <EditorContainer editor={editor!} />
            )}
          </div>
        )}
        <div className="flex gap-2 fixed bottom-0 justify-center ">
          <Button
            disabled={false}
            handleClick={saveText}
            value="CONFIRM"
            title="CONFIRM (a)"
            shortCut="a"
          />
          <Button
            disabled={false}
            handleClick={rejectTask}
            value="REJECT"
            title="REJECT (x)"
            shortCut="x"
          />
          <Button
            disabled={false}
            handleClick={undoTask}
            value="UNDO"
            title="UNDO (backspace)"
            shortCut="Backspace"
          />
        </div>
      </div>
    </div>
  );
}

export default DemoPage;
