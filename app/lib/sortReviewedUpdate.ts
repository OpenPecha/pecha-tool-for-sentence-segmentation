import { Text } from "@prisma/client";

export function sortUpdate_reviewed(a: Text, b: Text) {
  const parsedDate1 = new Date(a.updatedAt).valueOf();
  const parsedDate2 = new Date(b.updatedAt).valueOf();
  if (a.reviewed === b.reviewed) {
    return parsedDate2 - parsedDate1;
  }
  if (a.reviewed) {
    return 1;
  }
  if (b.reviewed) {
    return -1;
  }
  return 0;
}
