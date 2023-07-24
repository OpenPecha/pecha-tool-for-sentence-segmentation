import { DIVIDER } from "~/constant";
import { replaceNewlinewithTag } from "./utils";

function insertHTMLonText(content: string) {
  if (!content) return "";
  const regex = /\u23CE/g;
  let text = content.replace(regex, "");
  let split = splitText(text);
  let length = 0;
  let s_count = 1;
  let textHTML = `<Sn class='sen st-${s_count}'>`;
  split.forEach((word, index) => {
    if (word.includes(" ")) {
      textHTML += `<Ch class='seg s-${length}'>${word}</Ch>`;
      s_count += 1;
      textHTML += `</Sn><Sn class='sen st-${s_count}'>`;
      length += word.length;
    } else if (word === DIVIDER) {
      textHTML += `</Sn>`;
      length += 2;
      textHTML += replaceNewlinewithTag(word);
      textHTML += `<Sn class='sen st-${s_count}'>`;
    } else {
      textHTML += `<Ch class='seg s-${length}'>${word}</Ch>`;
      length += word.length;
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
            temp = [temp[0] + " ", temp[1]];
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
