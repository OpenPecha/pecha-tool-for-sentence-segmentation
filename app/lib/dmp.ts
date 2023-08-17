import DiffMatchPatch from "diff-match-patch";

export function getDiff(a, b) {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(a, b);
  dmp.diff_cleanupEfficiency(diff);
  let html = dmp.diff_prettyHtml(diff);
  return { diff, html };
}

export function getErrorCount(a: string, b: string) {
  const { diff } = getDiff(a, b);

  // Define weights for the operation codes
  const weights = {
    "-1": 5, // Weight for operation code -1
    "1": 1, // Weight for operation code 1
  };

  // Calculate the total weighted score
  const totalScore = diff.reduce((acc, [op, text]) => {
    if (op in weights) {
      return acc + text.length * weights[op];
    }
    return acc;
  }, 0);

  // Scale the score to be out of 100, if needed
  const scaledScore = totalScore; // You might want to scale it based on the length of the input or other factors

  return scaledScore;
}
