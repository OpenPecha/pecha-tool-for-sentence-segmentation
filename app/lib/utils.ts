import { DIVIDER, NEW_LINER } from "~/const";

export function replaceNewlinewithTag(text: string, length: number) {
  const tag =
    `<Divider class="d-${length} Divider">${NEW_LINER}</Divider>` + "<br/>";
  const replacedText = text.replace(new RegExp(DIVIDER, "g"), tag);
  return replacedText;
}

export function checkContentChange(oldText: string, newText: string) {
  return oldText === newText;
}

export function removeDivider(text: string) {
  return text.replace(new RegExp(DIVIDER, "g"), "");
}

