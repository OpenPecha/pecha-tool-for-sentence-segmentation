import { DIVIDER } from "~/constant";

export function replaceSpacesWithHTMLTag(text: string) {
  const tag = "<br/>";
  const replacedText = text.replace(new RegExp(DIVIDER, "g"), tag);
  return replacedText;
}

export function checkContentChange(oldText: string, newText: string) {
  return oldText === newText;
}

export function removeDivider(text: string) {
  return text.replace(new RegExp(DIVIDER, "g"), "");
}
