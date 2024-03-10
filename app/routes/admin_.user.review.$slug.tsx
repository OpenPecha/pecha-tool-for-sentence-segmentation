import { DataFunctionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { LoaderFunction, useLoaderData } from "react-router";
import checkUnknown from "~/lib/checkUnknown";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { getUser } from "~/model/server.user";
import AdminHistorySidebar from "~/components/AdminHistorySidebar";
import EditorContainer from "~/components/Editor";
import Button from "~/components/Button";
import { db } from "~/service/db.server";
import { sortUpdate_reviewed } from "~/lib/sortReviewedUpdate";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";

export const loader = async ({ request, params }: DataFunctionArgs) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let user = await getUser(session!, true);
  let annotator = await getUser(params.slug!, false);

  //check if user and admin are in same group

  if (annotator?.reviewer_id !== user?.id)
    return redirect("/?session=" + session);

  let text_data = await db.text.findMany({
    where: {
      modified_by_id: annotator?.id,
      status: "APPROVED",
      reviewed: false,
    },
    orderBy: { updatedAt: "desc" },
  });
  let currentText = await db.text.findFirst({
    where: {
      reviewed: false,
      modified_by_id: annotator?.id,
      status: "APPROVED",
    },
    orderBy: { id: "asc" },
  });
  return { user, annotator, text_data, id_now: currentText?.id };
};

function UserDetail() {
  const fetcher = useFetcher();
  const { annotator, text_data, user, id_now } = useLoaderData();
  let text = text_data?.sort((a, b) =>
    a.reviewed === b.reviewed ? 0 : !a.reviewed ? 1 : -1
  );
  const [content, setContent] = useState("");
  const [selectedId, setSelectedId] = useState<number | undefined>(id_now);
  useEffect(() => {
    setSelectedId(id_now);
  }, [id_now]);
  useEffect(() => {
    if (!annotator) return;
    let display = selectedId
      ? annotator.text.find((d) => d.id === selectedId)
      : annotator.text.sort(sortUpdate_reviewed).find((d) => d.id === text?.id);
    if (display) {
      let show =
        JSON.parse(display?.modified_text!)?.join(" ") ||
        display?.original_text;
      setContent(show);
    }
  }, [selectedId]);
  let editor = useEditorTiptap(content);

  if (!editor) return null;
  
  let saveText = async () => {
    fetcher.submit(
      {
        id: selectedId!,
        modified_text: editor?.getText()!,
        userId: annotator.id,
        adminId: user?.id,
      },
      { method: "POST", action: "/api/text" }
    );
  };

  let rejectTask = async () => {
    fetcher.submit(
      { id: selectedId!, userId: annotator.id, _action: "reject", admin: true },
      { method: "PATCH", action: "/api/text" }
    );
  };
  let isButtonDisabled = text.length < 1;
  return (
    <div className="flex flex-col md:flex-row">
      <AdminHistorySidebar
        user={annotator}
        selectedId={selectedId!}
        setSelectedId={setSelectedId}
      />

      <div className="flex-1 flex items-center flex-col md:mt-[10vh]">
        {!text || !selectedId || !editor ? (
          <div className="fixed top-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            Thank you . your work is complete ! 😊😊😊
          </div>
        ) : (
          <div className="fixed bottom-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            <div className="flex items-center justify-between opacity-75 text-sm font-bold px-2 capitalize pt-1 ">
              transcript
            </div>
            <EditorContainer editor={editor!} />
            {!editor && <div>loading...</div>}
          </div>
        )}
      
            <div className="flex gap-2 fixed bottom-0 justify-center">
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
            </div>
      </div>
    </div>
  );
}

export default UserDetail;
