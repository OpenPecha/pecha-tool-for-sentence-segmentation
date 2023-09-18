import { db } from "~/service/db.server";

export async function uploadData({ name, data }) {
  try {
    const existingRecord = await db.text.findFirst({
      where: {
        version: name,
      },
    });
    if (!!existingRecord) {
      console.log("Record already exists");
      return { error: "Record already exists" };
    }
    let UploadData = data?.map((item) => ({
      version: name,
      original_text: item.original_text,
      batch: item.batch,
    }));
    let uploaded = await db.text.createMany({
      data: UploadData,
    });
    return uploaded;
  } catch (e) {
    throw new Error("upload failed" + e);
  }
}
