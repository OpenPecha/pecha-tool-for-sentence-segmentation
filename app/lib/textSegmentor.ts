function makeSegment(text, start) {
  return {
    text: text,
    start: start,
    length: text.length,
  };
}

export default function segmentTibetanText(text) {
  const breaks = "༄༅།\n";
  const spaces = " ་";

  let segments = [];
  let currentSegment = "";
  let currentStart = 0;
  let inBreak = false;
  let inSpace = false;
  let count = 0;
  for (let char of text) {
    if (char === "\n") {
      currentSegment = "\n";
    } else if (breaks.includes(char)) {
      if (inBreak) {
        currentSegment += char;
      } else {
        if (count > 0) {
          const newSegment = makeSegment(currentSegment, currentStart);
          segments.push(newSegment);
        }

        inBreak = true;
        inSpace = false;
        currentSegment = char;
        currentStart = count;
      }
    } else if (spaces.includes(char)) {
      if (inSpace) {
        currentSegment += char;
      } else {
        if (count > 0) {
          const newSegment = makeSegment(currentSegment, currentStart);
          segments.push(newSegment);
        }

        inBreak = false;
        inSpace = true;
        currentSegment = char;
        currentStart = count;
      }
    } else {
      if (inSpace || inBreak) {
        if (count > 0) {
          const newSegment = makeSegment(currentSegment, currentStart);
          segments.push(newSegment);
        }

        inBreak = false;
        inSpace = false;
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
