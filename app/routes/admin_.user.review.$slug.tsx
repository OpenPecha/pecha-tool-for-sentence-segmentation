import { DataFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher, useRevalidator, useLoaderData } from "@remix-run/react";
import AdminHistorySidebar from "~/components/AdminHistorySidebar";
import EditorContainer from "~/components/Editor";
import Button from "~/components/Button";
import { db } from "~/service/db.server";
import { useEditorTiptap } from "~/tiptapProps/useEditorTiptap";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { useEffect, useRef, useState } from "react";
export const loader = async ({ request, params }: DataFunctionArgs) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  let trashed = url.searchParams.get("trashed");
  let detail = url.searchParams.get("detail");

  let history = url.searchParams.get("adminhistory");
  let load = url.searchParams.get("load") as string;
  let take = load ? parseInt(load) : 20;
  const user = await db.user.findUnique({
    where: { username: session! },
    select: {
      id: true,
      username: true,
    },
  });
  const annotator = detail
    ? await db.user.findUnique({
        where: { username: params.slug! },
        select: {
          text: {
            where: {
              status: "APPROVED",
              original_text: { not: "" },
            },
            select: {
              id: true,
              reviewed: true,
              status: true,
            },
            orderBy: { updatedAt: "desc" },
            take,
          },
          username: true,
          rejected_list: { select: { id: true, status: true } }, // Select specific fields or all (undefined)
          _count: {
            select: {
              text: { where: { reviewed: true } },
              rejected_list: true,
            },
          },
          reviewer_id: true,
          id: true,
        },
      })
    : await db.user.findUnique({
        where: { username: params.slug! },
      });

  let trashedtask = trashed
    ? await db.text.findMany({
        where: {
          OR: [
            { modified_by: { username: params.slug! } },
            { reviewed_by: { username: session! } },
          ],
          status: "TRASHED",
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];
  //check if user and admin are in same group
  if (annotator?.reviewer_id !== user?.id)
    return redirect("/?session=" + session);
  let currentText;
  if (history) {
    currentText = await db.text.findFirst({
      where: {
        id: parseInt(history),
        OR: [
          { modified_by_id: annotator?.id, status: "APPROVED" },
          { modified_by_id: annotator?.id, status: "TRASHED" },
        ],
      },
    });
  } else {
    currentText = await db.text.findFirst({
      where: {
        reviewed: false,
        modified_by_id: annotator?.id,
        status: "APPROVED",
        original_text: { not: "" },
      },
      orderBy: { id: "asc" },
    });
  }
  return { user, annotator, currentText, trashedtask };
};

function UserDetail() {
  const revalidate = useRevalidator();
  let interval = useRef();
  const { annotator, user, currentText } = useLoaderData();
  const submit_fetcher = useFetcher();
  let show = currentText?.reviewed
    ? JSON.parse(currentText?.reviewed_text!)?.join("\n")
    : !!currentText?.modified_text
    ? JSON.parse(currentText?.modified_text!)?.join("\n")
    : currentText?.original_text;
  let newText = currentText ? insertHTMLonText(show) : "";
  let editor = useEditorTiptap();

  useEffect(() => {
    if (interval.current) {
      console.log(interval.current);
      clearTimeout(interval.current);
    }
  }, [submit_fetcher?.data]);
  if (!editor) return null;
  let submit_url = "/api/text";
  function saveText() {
    let current_text = editor!.getText();
    let savedModified = current_text.replaceAll("↩️", "").split("\n");
    let modified_text = JSON.stringify(savedModified);
    interval.current = setTimeout(() => {
      revalidate.revalidate();
    }, 4000);
    let formData = new FormData();
    formData.append("id", currentText?.id!);
    formData.append("reviewed_text", modified_text);
    formData.append("userId", annotator.id);
    formData.append("adminId", user?.id);
    submit_fetcher.submit(formData, {
      method: "POST",
      action: submit_url,
    });
  }

  function rejectTask() {
    let formData = new FormData();
    formData.append("id", currentText?.id!);
    formData.append("userId", annotator.id);
    formData.append("_action", "reject");
    formData.append("admin", true);
    interval.current = setTimeout(() => {
      revalidate.revalidate();
    }, 4000);
    submit_fetcher.submit(formData, {
      method: "PATCH",
      action: submit_url,
    });
  }
  function trashTask() {
    let id = currentText?.id!;
    let formData = new FormData();
    formData.append("id", id);
    formData.append("_action", "trash");
    formData.append("userId", user.id);
    formData.append("isReviewer", true);
    interval.current = setTimeout(() => {
      revalidate.revalidate();
    }, 4000);
    submit_fetcher.submit(formData, {
      method: "PATCH",
      action: submit_url,
    });
  }

  let isButtonDisabled = !show || submit_fetcher.state !== "idle";
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
                {isButtonDisabled && (
                  <div className="w-full flex justify-center items-center">
                    {submit_fetcher.state}
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
              <Button
                disabled={isButtonDisabled}
                handleClick={trashTask}
                value="TRASH"
                title="TRASH (delete)"
                shortCut="Delete"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
