export function replaceSpacesWithHTMLTag(text: string) {
  const tag = "<Divider data-color='red'>༔</Divider>";
  const replacedText = text.replace(/༔/g, tag);
  return replacedText;
}

export function checkContentChange(oldText: string, newText: string) {
  return oldText === newText;
}

export function removeDivider(text: string) {
  return text.replace(/༔/g, "");
}
