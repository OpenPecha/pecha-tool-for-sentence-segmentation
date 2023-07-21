import { useEffect, useMemo, useRef } from "react";
import { EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import selectText from "~/lib/selectRange";
import { DIVIDER } from "~/constant";

let select = 0;

function EditorContainer({ editor }: { editor: Editor }) {
  let content = useMemo(() => editor.getText(), [editor.getText()]);
  function handlemouseOver(event) {
    let sen_count = event.target.classList[1].replace("st-", "");
    let select = document.querySelectorAll(".st-" + sen_count);
    select.forEach((element) => {
      element.classList.add("hover");
    });
  }
  function handlemouseLeave(event) {
    let sen_count = event.target.classList[1].replace("st-", "");
    let select = document.querySelectorAll(".st-" + sen_count);
    select.forEach((element) => {
      element.classList.remove("hover");
    });
  }
  useEffect(() => {
    const content = editor?.getText();
    let clickCount = 0;
    const segments = document.querySelectorAll(".seg");
    const sentenceSegment = document.querySelectorAll(".sen");
    const handleWordClick = (event) => {
      let element = event.target.parentElement;
      let modifiedContent = content;
      const selection = element.innerText;
      const locationText = element.classList;
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
          if (content[location] === DIVIDER) {
            modifiedContent =
              modifiedContent.slice(0, location) +
              modifiedContent.slice(location + 1);
          } else {
            modifiedContent =
              modifiedContent.slice(0, location) +
              DIVIDER +
              modifiedContent.slice(location);
          }
          const newText = insertHTMLonText(modifiedContent);
          editor?.commands.setContent(newText);
        } else if (clickCount === 2) {
          // Double click
          if (content[spaceToAddLocation] === DIVIDER) {
            modifiedContent =
              modifiedContent.slice(0, spaceToAddLocation) +
              modifiedContent.slice(spaceToAddLocation + 1);
          } else {
            modifiedContent =
              modifiedContent.slice(0, spaceToAddLocation) +
              DIVIDER +
              modifiedContent.slice(spaceToAddLocation);
          }
          const newText = insertHTMLonText(modifiedContent);
          editor?.commands.setContent(newText);
        }

        setTimeout(() => {
          clickCount = 0;
        }, 300);
      }, 200);
    };
    sentenceSegment.forEach((s) => {
      s.addEventListener("mouseover", handlemouseOver);
      s.addEventListener("mouseout", handlemouseLeave);
      s.addEventListener("click", handleWordClick);
    });

    if (select > 1) {
      let elements = document.querySelectorAll(".seg");
      selectText(elements[select]);
    }
    function handleKeyDown(e) {
      let key = e.key;
      let elements = document.querySelectorAll(".seg");

      if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === " "
      ) {
        if (key === " " && elements) {
          let id = elements[select].classList[1];
          console.log(id);
          let clickElement = document.querySelector("." + id);
          clickElement?.childNodes[0].click();
        }
        if (select >= 0) {
          if (key === "ArrowRight") {
            select = select < segments.length - 1 ? select + 1 : select;
            selectText(elements[select]);
          }
          if (key === "ArrowLeft") {
            select = select !== 0 ? select - 1 : select;
            selectText(elements[select]);
          }
        } else {
          select = 0;
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      sentenceSegment.forEach((segment) => {
        segment.removeEventListener("mouseover", handlemouseOver);
        segment.removeEventListener("mouseout", handlemouseLeave);
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
