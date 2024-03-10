import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Character } from "~/tiptapProps/extension/character";
import { Divider } from "~/tiptapProps/extension/divider";
import { Sentence } from "~/tiptapProps/extension/sentence";
import { editorProps } from "~/tiptapProps/events";
import insertHTMLonText from "~/lib/insertHtmlOnText";
import { useEffect } from "react";

export function useEditorTiptap(text: string) {

  
  let insertHTML = insertHTMLonText(text);
  const charClick = () => {};
  const setter = () => {};
  let editor=useEditor(
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
    []
  );

  useEffect(()=>{
   if(text){
    editor?.commands.setContent(insertHTML)
   }
  },[editor,text])

  return editor}
