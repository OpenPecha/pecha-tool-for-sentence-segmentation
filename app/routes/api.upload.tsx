import { ActionFunction } from "@remix-run/node";
import { uploadData } from "~/model/utils/server.dataUpload";

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  let data = formdata.get("data") as string;
  let name = formdata.get("name") as string;
  let parsed_Data = JSON.parse(data);
  if (request.method === "POST") {
    let status = await uploadData({ name, data: parsed_Data });
    return status;
  }
  return null;
};
