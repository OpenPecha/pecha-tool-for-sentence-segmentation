import { db } from "~/service/db.server";

export async function getCategories() {
  // console.time("getCategory");
  // let data = await db.text.findMany({
  //   where: {
  //     NOT: [{ category: null }, { category: "" }],
  //   },
  //   select: {
  //     category: true,
  //   },
  //   cacheStrategy: {
  //     ttl: 60,
  //     swr: 10,
  //   },
  // });
  // console.log(data);
  // console.timeEnd("getCategory");

  // const uniqueCategories = [...new Set(data.map((item) => item.category))];
  return ["gen"];
}
