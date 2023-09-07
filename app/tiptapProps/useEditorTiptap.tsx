import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Character } from "~/tiptapProps/extension/character";
import { Divider } from "~/tiptapProps/extension/divider";
import { Sentence } from "~/tiptapProps/extension/sentence";
import { editorProps } from "~/tiptapProps/events";
import insertHTMLonText from "~/lib/insertHtmlOnText";

export function useEditorTiptap(text: string) {
  const setter = () => {};
  const charClick = () => {};
  let insertHTML = insertHTMLonText(text);

  return useEditor(
    {
      extensions: [
        StarterKit,
        Divider(setter),
        Character(charClick),
        Sentence(setter),
      ],
      content: insertHTML,
      editorProps,
      editable: false,
    },
    [insertHTML]
  );
}
