import { db } from "~/service/db.server";

export async function getCategories() {
  let data = await db.text.findMany({
    select: {
      batch: true,
    },
  });
  let batch_list = data.map((item) => item.batch?.split("_")[0]);
  let unique_category_list = [...new Set(batch_list)];
  return unique_category_list;
}

export async function getCategoriesByReviewer(reviewer_id: string) {
  let data = await db.user.findFirst({
    where: { id: reviewer_id },
    select: { categories: true },
  });
  return data?.categories;
}
