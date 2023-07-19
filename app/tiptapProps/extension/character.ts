import { getMarkRange, Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, TextSelection } from "prosemirror-state";
import { removeDivider, replaceSpacesWithHTMLTag } from "../../lib/utils";
export interface optionType {
  multicolor: boolean;
  HTMLAttributes: Record<string, any>;
}
// declare module "@tiptap/core" {
//   interface Commands<ReturnType> {
//     Space: {
//       /**
//        * Set a highlight mark
//        */
//     //   setSpace: (attributes?: { color: string }) => ReturnType;
//       /**
//        * Toggle a highlight mark
//        */
//     //   toggleSpace: (attributes?: { color: string }) => ReturnType;
//       /**
//        * Unset a highlight mark
//        */
//     //   unsetSpace: () => ReturnType;
//     //   replaceSpace: (term: string) => ReturnType;
//     };
//   }
// }

export const Character = (charClick) =>
  Mark.create({
    name: "Character",

    addOptions() {
      return {
        multicolor: false,
        HTMLAttributes: {},
      };
    },

    addAttributes() {
      return {
        class: {
          default: "segment",
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: "Character",
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        "span",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0,
      ];
    },
  });
export declare const Highlight: Mark<optionType, any>;
