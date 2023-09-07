function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window?.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
export default selectText;
