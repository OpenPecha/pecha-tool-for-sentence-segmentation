import { DIVIDER } from "~/constant";
import { replaceSpacesWithHTMLTag } from "./utils";

function insertHTMLonText(text: string) {
  if (!text) return "";
  let split = splitText(text);
  let length = 0;
  let textHTML = "";
  split.forEach((word, index) => {
    if (word === "\n") {
      textHTML += replaceSpacesWithHTMLTag(word);
    } else {
      textHTML += `<Ch class='seg s-${length}'>${word}</Ch>`;
    }
    length += word.length;
  });
  return textHTML;
}

function splitText(text: string) {
  let splitText = text.match(/[^\n་།]+|[་།]|[\n]| /g);
  var mergedArray = [];
  if (splitText)
    for (var i = 0; i < splitText.length; i++) {
      let current = splitText[i];
      if (/[་།]/.test(current)) {
        if (mergedArray.length > 0) {
          mergedArray[mergedArray.length - 1] += current;
        } else {
          mergedArray.push(current);
        }
      } else {
        if (current.includes(" ")) {
          let temp = current.split(" ");
          temp = [temp[0], " ", temp[1]];
          mergedArray = [...mergedArray, ...temp];
        } else {
          mergedArray.push(current);
        }
      }
    }

  if (mergedArray[mergedArray.length - 1] === "undefined་") {
    mergedArray.pop();
  }
  return mergedArray;
}

export default insertHTMLonText;
