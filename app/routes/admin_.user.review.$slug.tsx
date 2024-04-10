import { DataFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useLoaderData } from "react-router";
import AdminHistorySidebar from "~/components/AdminHistorySidebar";
import EditorContainer from "~/components/Editor";
import Button from "~/components/Button";
import { db } from "~/service/db.server";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";
import insertHTMLonText from "~/lib/insertHtmlOnText";

export const loader = async ({ request, params }: DataFunctionArgs) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let history = url.searchParams.get("adminhistory");
  let load = url.searchParams.get("load") as string;
  let take = load ? parseInt(load) : 20;
  const [user, annotator] = await Promise.all([
    await db.user.findUnique({
      where: { username: session! },
    }),
    await db.user.findUnique({
      where: { username: params.slug! },
      select: {
        text: {
          where: {
            status: "APPROVED",
            reviewed: true,
          },
          select: {
            id: true,
            reviewed: true,
          },
          orderBy: { updatedAt: "desc" },
          take,
        },
        rejected_list: { select: { id: true } }, // Select specific fields or all (undefined)
        _count: {
          select: { text: { where: { reviewed: true } }, rejected_list: true },
        },
        reviewer_id: true,
        id: true,
        username: true,
      },
    }),
  ]);
  //check if user and admin are in same group
  if (annotator?.reviewer_id !== user?.id)
    return redirect("/?session=" + session);

  let currentText = await db.text.findFirst({
    where: {
      reviewed: false,
      modified_by_id: annotator?.id,
      status: "APPROVED",
    },
    orderBy: { id: "asc" },
  });
  if (history) {
    currentText = await db.text.findFirst({
      where: {
        status: "APPROVED",
        id: parseInt(history),
        modified_by_id: annotator?.id,
      },
    });
  }
  return { user, annotator, currentText };
};

function UserDetail() {
  const fetcher = useFetcher();
  const { annotator, user, currentText } = useLoaderData() as any;
  let show =
    (currentText && JSON.parse(currentText?.modified_text!)?.join("\n")) ||
    currentText?.original_text;
  let newText = currentText ? insertHTMLonText(show) : "";
  let editor = useEditorTiptap();

  if (!editor) return null;

  let saveText = async () => {
    fetcher.submit(
      {
        id: currentText?.id!,
        modified_text: editor?.getText()!,
        userId: annotator.id,
        adminId: user?.id,
      },
      { method: "POST", action: "/api/text" }
    );
  };

  let rejectTask = async () => {
    fetcher.submit(
      {
        id: currentText?.id!,
        userId: annotator.id,
        _action: "reject",
        admin: true,
      },
      { method: "PATCH", action: "/api/text" }
    );
  };

  let isButtonDisabled = !show || fetcher.state !== "idle";
  return (
    <div className="flex flex-col md:flex-row">
      <AdminHistorySidebar user={annotator} />

      <div className="flex-1 flex items-center flex-col md:mt-[10vh]">
        {!currentText || !editor ? (
          <div className="fixed top-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
            Thank you . your work is complete ! 😊😊😊
          </div>
        ) : (
          <>
            <div className="fixed top-[150px] md:static shadow-md max-h-[450px] w-[90%] rounded-sm md:h-[54vh]">
              <div className="flex items-center justify-between opacity-75 text-sm font-bold px-2 capitalize pt-1 ">
                transcript
                {fetcher.state !== "idle" && (
                  <div className="w-full flex justify-center items-center">
                    saving
                  </div>
                )}
              </div>
              {!editor && <div>loading...</div>}

              <EditorContainer editor={editor!} html={newText} />
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
