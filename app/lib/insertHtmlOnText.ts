import { DIVIDER, NEW_LINER } from "~/constant";
import { replaceNewlinewithTag } from "./utils";
import { splitText } from "@tenkus47/tibetan-segmentor";
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

export default insertHTMLonText;
