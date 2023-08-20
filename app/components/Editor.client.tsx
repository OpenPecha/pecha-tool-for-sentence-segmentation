import { useEffect, useMemo, MouseEvent } from "react";
import { EditorContent, Editor } from "@tiptap/react";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import selectText from "~/lib/selectRange";
import { DIVIDER } from "~/constant";

let select = 0;
let selectsentence = 0;
function EditorContainer({ editor }: { editor: Editor }) {
  if (!editor) {
    window.location.reload();
  }
  let content = useMemo(() => editor.getText(), [editor.getText()]);

  function getSTcount() {
    const elements = document.querySelectorAll("*");

    // Initialize an empty Set to store unique st- classes
    const stClassesSet = new Set();

    // Loop through each element and extract its class names
    elements.forEach((element) => {
      const classAttribute = element.getAttribute("class");
      if (classAttribute) {
        // Use a regular expression to find all class names starting with "st-"
        const pattern = /\bst-\d+/g;
        const stClasses = classAttribute.match(pattern);
        if (stClasses) {
          stClasses.forEach((stClass) => {
            // Add the st- class to the Set (this ensures only unique classes are stored)
            stClassesSet.add(stClass);
          });
        }
      }
    });
    return stClassesSet.size;
  }
  function handleMouse(event: MouseEvent, action: "over" | "leave") {
    let sen_count = event.target?.classList[1]?.replace("st-", "");
    if (!sen_count) return;
    let select = document.querySelectorAll(".st-" + sen_count);
    let lastst = getSTcount();
    select.forEach((element) => {
      if (action === "over") {
        element.classList.add("hover");
        if (sen_count == lastst) {
          //checked if its the last sentence
        }
      } else {
        element.classList.remove("hover");
      }
    });
  }
  useEffect(() => {
    const content = editor?.getText();
    let clickCount = 0;
    const segments: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".seg");
    const sentenceSegment: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".sen");
    const handleWordClick = (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      let parent = target.parentElement;
      let modifiedContent = content;
      const selection = parent?.innerText;
      const locationText = parent?.classList;
      const spaceToAddLocation =
        parseInt(locationText[1].replace("s-", "")) + selection.length;
      clickCount++;
      setTimeout(() => {
        if (clickCount === 1) {
          // Single click
          let classname = target.classList[1];
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
    const handleDividerClick = (ev: MouseEvent<HTMLDivElement>) => {
      const target = ev.target as HTMLDivElement;
      let location = parseInt(target.classList[0].replace("d-", ""));
      let modifiedContent = content;
      let first = modifiedContent.slice(0, location);

      let second = modifiedContent.slice(location + 3);
      modifiedContent = first + second;
      const newText = insertHTMLonText(modifiedContent);
      editor?.commands.setContent(newText);
    };
    sentenceSegment.forEach((s) => {
      s.addEventListener("mouseover", (e) => handleMouse(e, "over"));
      s.addEventListener("mouseout", (e) => handleMouse(e, "leave"));
      s.addEventListener("click", handleWordClick);
    });
    const dividers: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".Divider");

    dividers.forEach((divider) => {
      divider.addEventListener("click", (e) => handleDividerClick(e));
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
        segment.removeEventListener("mouseover", (e) => handleMouse(e, "over"));
        segment.removeEventListener("mouseout", (e) => handleMouse(e, "leave"));
        segment.removeEventListener("click", handleWordClick);
      });
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, content]);

  return (
    <div className="editor-container">
      <EditorContent editor={editor} style={{ maxWidth: "100%" }} />
    </div>
  );
}

export default EditorContainer;
