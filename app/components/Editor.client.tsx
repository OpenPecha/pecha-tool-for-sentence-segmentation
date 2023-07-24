import { useEffect, useMemo, useRef } from "react";
import { EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import selectText from "~/lib/selectRange";
import { DIVIDER, NEW_LINER } from "~/constant";

interface CustomMouseEvent extends MouseEvent {
  target: HTMLElement;
}

let select = 0;
let selectsentence = 0;
function EditorContainer({ editor }: { editor: Editor }) {
  let content = useMemo(() => editor.getText(), [editor.getText()]);

  function handleMouse(event: MouseEvent, action: "over" | "leave") {
    let sen_count = event.target?.classList[1]?.replace("st-", "");
    if (!sen_count) return;
    let select = document.querySelectorAll(".st-" + sen_count);
    select.forEach((element) => {
      if (action === "over") {
        element.classList.add("hover");
      } else {
        element.classList.remove("hover");
      }
    });
  }
  useEffect(() => {
    const content = editor?.getText();
    let clickCount = 0;
    const segments: HTMLElement[] | any = document.querySelectorAll(".seg");
    const sentenceSegment = document.querySelectorAll(".sen");
    const divider = document.querySelectorAll(".Divider");
    const handleWordClick = (event: CustomMouseEvent) => {
      let parent = event.target.parentElement;
      let modifiedContent = content;
      const selection = parent.innerText;
      const locationText = parent.classList;
      const spaceToAddLocation =
        parseInt(locationText[1].replace("s-", "")) + selection.length;
      clickCount++;
      setTimeout(() => {
        if (clickCount === 1) {
          // Single click
          let classname = event.target.classList[1];
          const elements = document.getElementsByClassName(classname);
          const lastElement = elements[elements.length - 1];
          let location =
            parseInt(
              lastElement?.parentElement?.classList[1].replace("s-", "")
            ) + lastElement.innerText.length;
          if (content[location + 2] === DIVIDER) {
            // modifiedContent =
            //   modifiedContent.slice(0, location) +
            //   modifiedContent.slice(location + 3);
          } else {
            modifiedContent =
              modifiedContent.slice(0, location) +
              DIVIDER +
              modifiedContent.slice(location);
            const newText = insertHTMLonText(modifiedContent);
            editor?.commands.setContent(newText);
          }
        } else if (clickCount === 2) {
          // Double click
          if (content[spaceToAddLocation + 2] === DIVIDER) {
            // modifiedContent =
            //   modifiedContent.slice(0, spaceToAddLocation) +
            //   modifiedContent.slice(spaceToAddLocation + 3);
          } else {
            modifiedContent =
              modifiedContent.slice(0, spaceToAddLocation) +
              DIVIDER +
              modifiedContent.slice(spaceToAddLocation);
            const newText = insertHTMLonText(modifiedContent);
            editor?.commands.setContent(newText);
          }
        }

        setTimeout(() => {
          clickCount = 0;
        }, 300);
      }, 200);
    };
    const handleDividerClick = (e: CustomMouseEvent) => {
      let location = parseInt(e.target.classList[0].replace("d-", ""));
      let modifiedContent = content;
      let first = modifiedContent.slice(0, location + 1);
      let second = modifiedContent.slice(location + 4);
      modifiedContent = first + second;
      const newText = insertHTMLonText(modifiedContent);
      editor?.commands.setContent(newText);
    };
    sentenceSegment.forEach((s) => {
      s.addEventListener("mouseover", (event) => handleMouse(event, "over"));
      s.addEventListener("mouseout", (event) => handleMouse(event, "leave"));
      s.addEventListener("click", handleWordClick);
    });
    divider.forEach((d) => {
      d.addEventListener("click", handleDividerClick);
    });
    if (select > 1) {
      selectText(segments[select]);
    }
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)
      ) {
        if (key === " " && segments) {
          const id = segments[select]?.classList[1];
          const clickElement = document.querySelector("." + id);
          clickElement?.childNodes[0].click();
        }

        if (select >= 0) {
          switch (key) {
            case "ArrowRight":
              select = select < segments.length - 1 ? select + 1 : select;
              selectText(segments[select]);
              break;
            case "ArrowLeft":
              select = select !== 0 ? select - 1 : select;
              selectText(segments[select]);
              break;
          }
        } else {
          select = 0;
        }

        if (key === "ArrowUp" || key === "ArrowDown") {
          const id = segments[select]?.classList[1];
          const selected = document.querySelector("." + id);
          const currentSentence = parseInt(
            selected?.childNodes[0]?.classList[1]?.replace("st-", "")
          );

          if (key === "ArrowUp" && currentSentence && currentSentence > 1) {
            selectsentence = currentSentence - 1;
          }
          if (key === "ArrowDown" && currentSentence) {
            selectsentence = currentSentence + 1;
          }

          const next = document.querySelector(
            ".st-" + selectsentence
          )?.parentNode;

          if (!selectsentence || !next) return;

          const selectClass = next?.classList[1];
          let selectedElement = null;

          segments.forEach((element, index) => {
            if (element.classList.contains(selectClass)) {
              selectedElement = index;
              return; // To exit the loop once the target element is found
            }
          });

          select = selectedElement;
          selectText(segments[select]);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      sentenceSegment.forEach((segment) => {
        segment.removeEventListener("mouseover", (event) =>
          handleMouse(event, "over")
        );
        segment.removeEventListener("mouseout", (event) =>
          handleMouse(event, "leave")
        );
        segment.removeEventListener("click", handleWordClick);
      });
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, content]);
  const handleClick = () => {
    let { from, to } = editor?.state.selection;
    let content = editor?.getText();
    if (!content) return;
    let modifiedContent =
      content.substring(0, from - 1) + DIVIDER + content.substring(to - 1);
    let newText = insertHTMLonText(modifiedContent);
    editor?.commands.setContent(newText);
  };

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={(editor) => {
            let { from } = editor;
            let textLength = editor?.editor.getText().length;
            let textContent = editor.state.doc.textBetween(from - 1, from, "");
            if (from === 1 || from - 1 === textLength || textContent === " ")
              return false;
            if (editor.state.selection.from === editor.state.selection.to)
              return true;
            return false;
          }}
        >
          <button
            onClick={handleClick}
            id="spaceButton"
            style={{ display: "none" }}
          ></button>
        </BubbleMenu>
      )}
    </div>
  );
}

export default EditorContainer;
