import { DIVIDER, NEW_LINER } from "~/const";
import { replaceNewlinewithTag } from "./utils";
import segmentTibetanText from "./textSegmentor";

function insertHTMLonText(content: string): string {
  if (!content) return "";
  
  const regex = new RegExp(NEW_LINER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const data = splitText(content);
  let sentenceCount = 1;
  let charCount = 0;

  let textHTML = `<Sn class='sen st-${sentenceCount}'>`;
  data.forEach(({ char, start }) => {
    const cleanedWord = char.replace(regex, "");

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
  let segment = segmentTibetanText(text);
  let data = segment.map((item) => item.text);
  let finalItem = [];
  
  for (var i = 0; i < data.length; i++) {
    if (data[i].startsWith("\n")) {
      let temp = data[i].split("\n");
      finalItem.push("\n");
      finalItem.push(temp[1]);
    }  else if (data[i + 1] === "་") {
      if (data[i + 2] === "།" && data[i + 3] === " " && data[i + 4] === "།") {
        let temp =
          data[i] + data[i + 1] + data[i + 2] + data[i + 3] + data[i + 4];
        finalItem.push(temp);
        i = i + 4;
      } else if (
        data[i + 2] === "།" &&
        data[i + 3] === " " &&
        data[i + 4] !== "།"
      ) {
        let temp = data[i] + data[i + 1] + data[i + 2] + data[i + 3];
        finalItem.push(temp);
        i = i + 3;
      } else if (data[i + 2] === " ") {
        finalItem.push(data[i] + "་ ");
        i = i + 2;
      } else {
        finalItem.push(data[i] + data[i + 1]);
        i+=data[i+1].length;
      }
    } else if (data[i + 1] === "་ ") {
      if (data[i + 2] === "།" && data[i + 3] === " " && data[i + 4] === "།") {
        let temp =
          data[i] + data[i + 1] + data[i + 2] + data[i + 3] + data[i + 4];
        finalItem.push(temp);
        i = i + 4;
      } else if (
        data[i + 2] === "།" &&
        data[i + 3] === " " &&
        data[i + 4] !== "།"
      ) {
        let temp = data[i] + data[i + 1] + data[i + 2] + data[i + 3];
        finalItem.push(temp);
        i = i + 3;
      } else {
        finalItem.push(data[i] + data[i + 1]);
        i++;
      }
    } else if (data[i + 1] === "།") {
      if (data[i + 2] === " " && data[i + 3] === "།") {
        let temp = data[i] + data[i + 1] + data[i + 2] + data[i + 3];
        finalItem.push(temp);
        i = i + 3;
      } else if (data[i + 2] === " " && data[i + 3] === "\n") {
        finalItem.push(data[i] + data[i + 1] + " ");
        finalItem.push("\n");
        i = i + 3;
      } else if (data[i + 2] === " ") {
        let temp = data[i]+data[i + 1]+data[i + 2];
        finalItem.push(temp);
        i=i+temp.length-1;
      }
    } else if (data[i + 1] === " ") {
      if (data[i + 2] === "།") {
        let temp = data[i] + data[i + 1] + data[i + 2];
        finalItem.push(temp);
        i = i +2;
      } else {
        let temp=data[i] + data[i + 1];
        finalItem.push(temp);
        i+=1;
      }
    } else {
      if (data[i].endsWith("།") && data[i + 1] === " " && data[i + 2] === "།") {
        let temp = data[i] + data[i + 1] + data[i + 2];
        finalItem.push(temp);
        i = i + 2;
      } else if (
        data[i].endsWith("།") &&
        data[i + 1] === " " &&
        data[i + 2] !== "།"
      ) {
        let temp = data[i] + data[i + 1];
        finalItem.push(temp);
        i = i + 1;
      } else {
        finalItem.push(data[i]);
      }
    }
  }
  let count = 0;
  return finalItem.map((item) => {
    let data = { char: item, start: count };
    count += item.length;
    return data;
  });
}

export default insertHTMLonText;
