import { LoaderFunction, defer, redirect } from "@remix-run/node";
import AboutText from "~/components/admin/AboutText";
import { getUniqueTextsGroup } from "~/model/server.group";
import { getLastBatch } from "~/model/server.text";
import { getUser } from "~/model/server.user";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let session = url.searchParams.get("session");
  if (!session) return redirect("/error");
  let texts = await getUniqueTextsGroup();
  let user = await getUser(session, true);
  let lastbatch = await getLastBatch();
  return defer({
    user,
    texts,
    lastbatch,
  });
};

function Admin_Text() {
  return <AboutText />;
}

export default Admin_Text;
