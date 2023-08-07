import { LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import { getAsignedReviewText } from "~/model/text";
import { getUser } from "~/model/user";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { getDiff } from "~/lib/dmp";
import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { editorProps } from "~/tiptapProps/events";

import { Divider } from "~/tiptapProps/extension/divider";
import { Character } from "~/tiptapProps/extension/character";
import { Sentence } from "~/tiptapProps/extension/sentence";
import EditorContainer from "~/components/Editor.client";
import { ClientOnly } from "remix-utils";
import checkUnknown from "~/lib/checkUnknown";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import Button from "~/components/Button";
import { NEW_LINER } from "~/constant";
export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session") as string;
  let history = url.searchParams.get("history") || null;

  let user = await getUser(session);
  if (!user) return redirect("/error");
  if (user.role !== "reviewer") return redirect("/?session=" + session);
  let data = await getAsignedReviewText(user, history);
  let ga = data?.ga;
  let gb = data?.gb;
  let review = data?.review;
  let text = data?.text;
  return { ga, gb, review, text, user };
};
function review() {
  let { user, ga, gb, text, review } = useLoaderData();
  let data = useLoaderData();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");

  let textContent = text?.original_text?.trim();
  let insertHTML = insertHTMLonText(textContent);
  let newText = review ? selectedText.trim() : checkUnknown(insertHTML);
  const setter = () => {};
  const charClick = () => {};
  useEffect(() => {
    if (ga && gb) {
      let text = "";
      if (tabIndex === 0) {
        text = JSON.parse(ga.modified_text).join("\n");
      }
      if (tabIndex === 1) {
        text = JSON.parse(gb.modified_text).join("\n");
      }
      let insertHTML = insertHTMLonText(text);
      let newText = checkUnknown(insertHTML);
      setSelectedText(newText);
    }
  }, [tabIndex, ga, gb]);
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
  let isButtonDisabled = false;
  let fetcher = useFetcher();
  let saveText = async () => {
    let text = editor?.getText();
    const escapedSymbol = NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSymbol, "g");
    if (review) {
      let reviewed_text = text?.replace(regex, "")!;
      let ga_id = ga.id;
      let gb_id = gb.id;
      fetcher.submit(
        { ga_id, gb_id, reviewed_text, userId: user.id },
        { method: "POST", action: "/api/reviewed" }
      );
    } else {
      let modified_text = text?.replace(regex, "")!;
      let id = data.text.id;
      fetcher.submit(
        { id, modified_text, userId: user.id },
        { method: "POST", action: "/api/text" }
      );
    }
  };
  let undoTask = async () => {
    // let text = checkUnknown(insertHTMLonText(data?.text?.original_text));
    // editor?.commands.setContent(text);
  };
  let ignoreTask = async () => {
    // let id = data.text.id;
    // fetcher.submit(
    //   { id, userId: user.id, _action: "ignore" },
    //   { method: "PATCH", action: "/api/text" }
    // );
  };
  let rejectTask = async () => {
    // let id = data.text.id;
    // fetcher.submit(
    //   { id, userId: user.id, _action: "reject" },
    //   { method: "PATCH", action: "/api/text" }
    // );
  };
  return (
    <div className="main">
      <Sidebar user={user} online={[]} reviewer={true}></Sidebar>
      <div className="groupText relative max-w-[100vw] max-h-[100dvh] md:max-w-[80vw] mx-auto pt-[50px]">
        {review && (
          <Tabs
            style={{
              padding: 10,
              maxWidth: 800,
              marginInline: "auto",
              marginBottom: 20,
            }}
            selectedIndex={tabIndex}
            onSelect={(index) => setTabIndex(index)}
          >
            <TabList>
              <Tab>A</Tab>
              <Tab>B</Tab>
            </TabList>
            <TabPanel style={{ maxHeight: "30vh", overflowY: "scroll" }}>
              <EachPanel textA={ga?.original_text} textB={ga?.modified_text} />
            </TabPanel>
            <TabPanel style={{ maxHeight: "30vh", overflowY: "scroll" }}>
              <EachPanel textA={gb?.original_text} textB={gb?.modified_text} />
            </TabPanel>
          </Tabs>
        )}

        <ClientOnly fallback={null}>
          {() =>
            editor && (
              <div className="shadow-lg max-h-[30vh] overflow-y-scroll text-xl max-w-3xl mx-2 md:mx-auto ">
                <EditorContainer editor={editor!} />
              </div>
            )
          }
        </ClientOnly>

        <ClientOnly fallback={null}>
          {() => (
            <div className="flex gap-3 fixed md:absolute bottom-0 justify-center mx-auto w-full">
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
                handleClick={ignoreTask}
                type="IGNORE"
                title="IGNORE (i)"
                shortCut="i"
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

export default review;

function EachPanel({ textA, textB }) {
  let [newText, setNewText] = useState("");

  let a = textA || "";
  let b = "";
  if (textB) b = JSON.parse(textB).join("\n");

  var oldStr = "",
    newStr = "";
  useEffect(() => {
    let d = getDiff(a, b);
    for (var i = 0, j = d.length; i < j; i++) {
      var arr = d[i];
      if (arr[0] == 0) {
        oldStr += arr[1];
        newStr += arr[1];
      } else if (arr[0] == -1) {
        oldStr += "<span class='text-del'>" + arr[1] + "</span>";
      } else {
        newStr += "<span class='text-add'>" + arr[1] + "</span>";
      }
    }

    setNewText(newStr);
  }, [a, b]);
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: newText }}></div>
    </div>
  );
}
