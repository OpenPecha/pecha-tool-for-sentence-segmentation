export function replaceSpacesWithHTMLTag(text: string) {
  const tag="<Space data-color='red'> </Space>";
  const replacedText = text.replace(/\s/g, tag);
  return replacedText;
}

export function checkContentChange(oldText:string, newText:string ) {
    return oldText === newText; 
}

export function removeSpace(text:string) {
    return text.replace(/\s/g, "");
}