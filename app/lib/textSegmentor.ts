function makeSegment(text, start) {
  return {
    text: text,
    start: start,
    length: text.length,
  };
}

export default function segmentTibetanText(text:string) {
  const breaks = "༄༅།";
  const spaces = " ་";
  const newline = "\n";

  let segments = [];
  let currentSegment = "";
  let currentStart = 0;
  let inBreak = false;
  let inSpace = false;
  let count = 0;

  function processCurrentSegment() {
    if (count > 0) {
      const newSegment = makeSegment(currentSegment, currentStart);
      segments.push(newSegment);
      currentSegment = "";
      inBreak = false;
      inSpace = false;
    }
  }
  if (text===''||text===null) return ''
  for (let char of text) {
    if (char === newline) {
      processCurrentSegment();
      currentSegment = char;
      currentStart = count + 1; // Move to the next character after the newline
    } else if (breaks.includes(char)) {
      if (inBreak) {
        currentSegment += char;
      } else {
        processCurrentSegment();
        inBreak = true;
        currentSegment = char;
        currentStart = count;
      }
    } else if (spaces.includes(char)) {
      if (inSpace) {
        currentSegment += char;
      } else {
        processCurrentSegment();
        inSpace = true;
        currentSegment = char;
        currentStart = count;
      }
    } else {
      if (inSpace || inBreak) {
        processCurrentSegment();
        currentSegment = char;
        currentStart = count;
      } else {
        currentSegment += char;
      }
    }

    count++;
  }

  if (currentSegment) {
    const newSegment = makeSegment(currentSegment, currentStart);
    segments.push(newSegment);
  }
  return segments;
}
