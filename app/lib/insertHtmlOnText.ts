import { replaceSpacesWithHTMLTag } from "./utils";

function insertHTMLonText(text: string) {
  let split = splitText(text);
  let length = 0;
  let textHTML = "";
  split.forEach((word, index) => {
    if (word === " ") {
      textHTML += replaceSpacesWithHTMLTag(word);
    } else {
      textHTML += `<Character class='segment s-${length}'>${word}</Character>`;
    }
    length += word.length;
  });
  return textHTML;
}

function splitText(text: string) {
  let splitText = text.match(/[^་།\s]+|[་།\s]/g);
  var mergedArray = [];
  if (splitText)
    for (var i = 0; i < splitText.length; i++) {
      if (/[་།]/.test(splitText[i])) {
        if (mergedArray.length > 0) {
          mergedArray[mergedArray.length - 1] += splitText[i];
        } else {
          mergedArray.push(splitText[i]);
        }
      } else {
        mergedArray.push(splitText[i]);
      }
    }

  if (mergedArray[mergedArray.length - 1] === "undefined་") {
    mergedArray.pop();
  }
  return mergedArray;
}

export default insertHTMLonText;
