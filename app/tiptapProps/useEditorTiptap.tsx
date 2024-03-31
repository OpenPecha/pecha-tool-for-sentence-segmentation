import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Character } from "~/tiptapProps/extension/character";
import { Divider } from "~/tiptapProps/extension/divider";
import { Sentence } from "~/tiptapProps/extension/sentence";
import { editorProps } from "~/tiptapProps/events";

export function useEditorTiptap() {
  const charClick = () => {};
  const setter = () => {};
  let editor = useEditor(
    {
      extensions: [
        StarterKit,
        Divider(setter),
        Character(charClick),
        Sentence(setter),
      ],
      editorProps,
      editable: false,
    },
    []
  );
  return editor;
}
