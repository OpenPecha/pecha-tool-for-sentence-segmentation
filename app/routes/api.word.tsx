import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let sentence = url.searchParams.get("sentence");
  let dakjeurl = "https://dakje.io/api/tokenize";
  let body = JSON.stringify({
    content: sentence,
  });
  let res = await fetch(dakjeurl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Set the content type based on your API requirements
    },
    body,
  });
  let data = await res.json();
  let join_word = data.words.map((item) => item.form).join(" ");
  return join_word;
};
