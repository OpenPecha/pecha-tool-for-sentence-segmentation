import { DIVIDER, NEW_LINER } from "~/constant";

export function replaceNewlinewithTag(text: string) {
  const tag = NEW_LINER + "<br/>";
  const replacedText = text.replace(new RegExp(DIVIDER, "g"), tag);
  return replacedText;
}

export function checkContentChange(oldText: string, newText: string) {
  return oldText === newText;
}

export function removeDivider(text: string) {
  return text.replace(new RegExp(DIVIDER, "g"), "");
}
