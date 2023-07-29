import { DIVIDER, NEW_LINER } from "~/constant";
import { replaceNewlinewithTag } from "./utils";

function insertHTMLonText(content: string): string {
  if (!content) return "";

  const regex = new RegExp(NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const words = splitText(content);
  let sentenceCount = 1;
  let charCount = 0;

  let textHTML = `<Sn class='sen st-${sentenceCount}'>`;

  words.forEach((word) => {
    const cleanedWord = word.replace(regex, "");

    if (cleanedWord.includes(" ")) {
      textHTML += `<Ch class='seg s-${charCount}'>${cleanedWord}</Ch>`;
      sentenceCount += 1;
      textHTML += `</Sn><Sn class='sen st-${sentenceCount}'>`;
      charCount += cleanedWord.length;
    } else if (cleanedWord === DIVIDER) {
      textHTML += `</Sn>`;
      textHTML += replaceNewlinewithTag(cleanedWord, charCount);
      sentenceCount += 1;
      charCount += 3;
      textHTML += `<Sn class='sen st-${sentenceCount}'>`;
    } else {
      textHTML += `<Ch class='seg s-${charCount}'>${cleanedWord}</Ch>`;
      charCount += cleanedWord.length;
    }
  });

  textHTML += "</Sn>";
  return textHTML;
}
function splitText(text: string) {
  let splitText = text.match(/[^\n་།]+|[་།]|[\n]/g);
  var mergedArray: any = [];
  if (splitText)
    for (var i = 0; i < splitText.length; i++) {
      let current = splitText[i];

      if (/[་།]|[ ]/.test(current)) {
        if (mergedArray.length > 0) {
          if (current.includes(" ") && current?.length > 1) {
            let temp = current.split(" ");
            if (temp.includes("།")) {
              temp = [temp[0], " "];
            } else {
              temp = [temp[0] + " ", temp[1]];
            }
            mergedArray = [...mergedArray, ...temp];
          } else {
            mergedArray[mergedArray.length - 1] += current;
          }
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
