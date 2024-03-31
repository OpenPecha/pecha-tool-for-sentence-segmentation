import { ActionFunction } from "@remix-run/node";
import { uploadData } from "~/model/utils/dataUpload.server";

export const action: ActionFunction = async ({ request }) => {
  let formdata = await request.formData();
  let data = formdata.get("data") as string;
  let name = formdata.get("name") as string;
  let parsed_Data = JSON.parse(data);
  let parsed_Name = JSON.parse(name);
  if (request.method === "POST") {
    let status = await uploadData({ name: parsed_Name, data: parsed_Data });
    return status;
  }
  return null;
};
