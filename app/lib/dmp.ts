import DiffMatchPatch from "diff-match-patch";

export function getDiff(a, b) {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(a, b);
  dmp.diff_cleanupEfficiency(diff);
  return diff;
}
