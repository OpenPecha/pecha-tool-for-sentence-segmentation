import { Text } from "@prisma/client";

export function sortUpdate_reviewed(a: Text, b: Text) {
  const parsedDate1 = new Date(a.updatedAt);
  const parsedDate2 = new Date(b.updatedAt);
  if (!!a.reviewed_text === !!b.reviewed_text) {
    return parsedDate2 - parsedDate1;
  }
  if (!!a.reviewed_text) {
    return 1;
  }
  if (!!b.reviewed_text) {
    return -1;
  }
  return 0;
}
