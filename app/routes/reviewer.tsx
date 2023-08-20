import { LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getAsignedReviewText } from "~/model/text";
import { getUser } from "~/model/user";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { getDiff, getErrorCount } from "~/lib/dmp";
import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import { NEW_LINER } from "~/constant";
import { editorProps } from "~/tiptapProps/events";
import { Divider } from "~/tiptapProps/extension/divider";
import { Character } from "~/tiptapProps/extension/character";
import { Sentence } from "~/tiptapProps/extension/sentence";
import { ClientOnly } from "remix-utils";
import EditorContainer from "~/components/Editor.client";
import checkUnknown from "~/lib/checkUnknown";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import Button from "~/components/Button";
import StarterKit from "@tiptap/starter-kit";
import Sidebar from "~/components/Sidebar";
import { useEditorContainer } from "~/lib/hook/useEditorContainer";

export function meta() {
  return [
    { title: "review pechatool" },
    { name: "description", content: "reviewer page for pechatool" },
  ];
}

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session") as string;
  let history = url.searchParams.get("history") || null;
  let user = await getUser(session);
  if (!user) return redirect("/error");
  if (user.role !== "reviewer") return redirect("/?session=" + session);
  let data = await getAsignedReviewText(user, history);
  if (!data) return { ga: null, gb: null, review: null, text: null, user };
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
    if (review) {
      let text = "";
      if (tabIndex === 0) {
        text = JSON.parse(ga?.modified_text)?.join("\n");
      }
      if (tabIndex === 1) {
        text = JSON.parse(gb?.modified_text)?.join("\n");
      }
      let insertHTML = insertHTMLonText(text);
      let newText = checkUnknown(insertHTML);
      setSelectedText(newText);
    }
  }, [tabIndex, review, ga?.modified_text]);
  const editor = useEditorContainer(newText);
  let fetcher = useFetcher();
  let isButtonDisabled = fetcher.state !== "idle";
  let saveText = async () => {
    let text = editor?.getText();
    const escapedSymbol = NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSymbol, "g");
    if (review) {
      let a_error_count = getErrorCount(
        JSON.parse(ga.modified_text).join("\n"),
        text!
      );
      let b_error_count = getErrorCount(
        JSON.parse(gb.modified_text).join("\n"),
        text!
      );

      let reviewed_text = text?.replace(regex, "")!;
      let ga_id = ga.id;
      let gb_id = gb.id;

      fetcher.submit(
        {
          ga_id,
          gb_id,
          reviewed_text,
          userId: user.id,
          a_error_count,
          b_error_count,
        },
        { method: "POST", action: "/api/reviewed" }
      );
    } else {
      let modified_text = text?.replace(regex, "")!;
      let id = data.text.id;
      fetcher.submit(
        { id, modified_text, userId: user.id, reviewer: true },
        { method: "POST", action: "/api/text" }
      );
    }
  };
  let undoTask = async () => {
    let text = newText;
    editor?.commands.setContent(text);
  };

  return (
    <div className="flex flex-col md:flex-row overflow-hidden w-screen h-screen">
      <Sidebar
        batch={ga?.batch && ga?.batch?.slice(0, -1) + "c"}
        user={user}
        reviewer={true}
      ></Sidebar>
      <div className="flex flex-1 justify-around items-center flex-col md:flex-row">
        <div className="fixed bottom-[150px] md:top-[-80px] md:relative  max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
          {review ? (
            <Tabs
              className="p-3 max-w-[800px] mx-auto mb-5"
              selectedIndex={tabIndex}
              onSelect={(index) => setTabIndex(index)}
            >
              <TabList>
                <Tab>A( {ga?.modified_by?.username} )</Tab>
                <Tab>B( {gb?.modified_by?.username} )</Tab>
              </TabList>
            </Tabs>
          ) : (
            <div className="label mb-2 shadow-lg">Text</div>
          )}
          {!data.text && !data.ga ? (
            <div>Thank you . your work is complete ! 😊😊😊</div>
          ) : (
            <ClientOnly fallback={null}>
              {() =>
                editor && (
                  <>
                    <div className="max-h-[50vh] w-full max-w-[650px] p-2 overflow-y-scroll shadow-md text-xl  mx-auto">
                      <EditorContainer editor={editor!} />
                    </div>
                  </>
                )
              }
            </ClientOnly>
          )}
        </div>

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
