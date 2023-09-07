import { LoaderFunction } from "@remix-run/node";
import { db } from "~/service/db.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  let version = params.version;
  let text = await db.text.findMany({
    where: {
      version: version,
      modified_text: { not: null },
      reviewed: true,
    },
    orderBy: {
      id: "asc",
    },
    select: {
      modified_text: true,
    },
  });
  return text.map((item) => JSON.parse(item?.modified_text!));
};
