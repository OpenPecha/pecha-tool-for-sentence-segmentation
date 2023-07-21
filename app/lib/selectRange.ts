function selectText(element: HTMLElement) {
  const sen_count = element.classList[1]?.replace("st-", "");
  if (!sen_count) return;

  const classname = document.querySelector(`.${sen_count} > :first-child`)
    ?.classList[1];
  if (!classname) return;

  const notSelected = document.querySelectorAll(".sen");
  notSelected.forEach((el) => el.classList.remove("hover"));

  const select = document.querySelectorAll(`.${classname}`);
  select.forEach((el) => el.classList.add("hover"));

  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
export default selectText;
