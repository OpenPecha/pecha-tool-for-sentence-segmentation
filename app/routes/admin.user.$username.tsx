import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import AboutUser from "~/components/admin/AboutUser";
import { removeBatchFromUser } from "~/model/user.server";
import { getCategories } from "~/model/utils/category.server";
import { db } from "~/service/db.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  let username = params.username;
  const [user, categories] = await Promise.all([
    db.user.findUnique({
      where: { username },
      select: {
        id: true,

        reviewer: {
          select: {
            username: true,
          },
        },
        username: true,
        role: true,
        picture: true,
        nickname: true,
        categories: true,
        allow_assign: true,
      },
      cacheStrategy: {
        ttl: 60,
        swr: 10,
      },
    }),
    getCategories(),
  ]);

  return { user, categories };
};

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  if (request.method === "DELETE") {
    let batch = formdata.get("batch") as string;
    let userId = formdata.get("id") as string;
    let removed = await removeBatchFromUser(parseInt(batch), userId);
    return removed;
  }
};

function User() {
  const fetcher = useFetcher();
  let { user } = useLoaderData();

  return <AboutUser selectedUser={user} />;
}

export default User;
