import { useEffect, useMemo, useRef } from "react";
import { EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import selectText from "~/lib/selectRange";
import { DIVIDER } from "~/constant";

let select = 0;

function EditorContainer({ editor }: { editor: Editor }) {
  let content = useMemo(() => editor.getText(), [editor.getText()]);
  useEffect(() => {
    const content = editor?.getText();
    let elements = [];
    const events = [];

    const segments = document.querySelectorAll(".seg");
    const handleSegmentClick = (event) => {
      let modifiedContent = content;
      const selection = event.target.innerText;
      const locationText = event.target.classList;
      const spaceToAddLocation =
        parseInt(locationText[1].replace("s-", "")) + selection.length;
      clickCount++;

      setTimeout(() => {
        if (clickCount === 1) {
          // Single click
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
        } else if (clickCount === 2) {
          console.log("double click");
        }

        setTimeout(() => {
          clickCount = 0;
        }, 300);
      }, 200);
    };
    segments.forEach((segment, i) => {
      elements.push(segment);
      const event = {
        segment,
        listener: handleSegmentClick,
      };
      segment.addEventListener("click", event.listener);
      events[i] = event;
    });
    selectText(elements[select]);
    let clickCount = 0;

    function handleKeyDown(e) {
      let key = e.key;
      if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === " "
      ) {
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
        if (key === " ") {
          elements[select].click();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      segments.forEach((segment, i) => {
        segment.removeEventListener("click", events[i].listener);
      });
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, content]);
  const handleClick = () => {
    let { from, to } = editor?.state.selection;
    let content = editor?.getText();
    if (!content) return;
    let modifiedContent =
      content.substring(0, from - 1) + " " + content.substring(to - 1);
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
