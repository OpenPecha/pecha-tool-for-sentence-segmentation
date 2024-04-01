import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import AboutText, { PER_PAGE } from "~/components/admin/AboutText";
import { getGroupInfo } from "~/model/group.server";
import { db } from "~/service/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let query = url.searchParams;
  let session = query.get("session");
  const currentPage = Math.max(Number(query.get("page")) || 1, 1);
  let skip = (currentPage - 1) * PER_PAGE;

  if (!session) return redirect("/error");

  let user = await db.user.findUnique({
    where: { username: session },
    select: {
      id: true,
      role: true,
      username: true,
    },
  });

  const texts = await db.text.findMany({
    select: {
      version: true,
      batch: true,
      category: true, // Include category in the query
    },
    orderBy: {
      updatedAt: "desc",
    },
    distinct: ["version"],
    take: PER_PAGE,
    skip,
  });
  const lastbatch = currentPage === 1 ? texts[0]?.batch : null;
  const count = await db.text.groupBy({
    by: ["version"],
  });
  return json({
    user,
    texts,
    lastbatch,
    count: count.length,
  });
};
export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  let version = formdata.get("version") as string;
  let _action = formdata.get("_action") as string;

  if (_action === "get_info") {
    let text = getGroupInfo(version);
    return text;
  }
  return null;
};
function Admin_Text() {
  return <AboutText />;
}

export default Admin_Text;
