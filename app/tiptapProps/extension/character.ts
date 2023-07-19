import { getMarkRange, Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, TextSelection } from "prosemirror-state";
import { removeSpace, replaceSpacesWithHTMLTag } from "../../lib/utils";
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

    // addCommands() {
    //   return {
    //     setSpace:
    //       (attributes) =>
    //       ({ commands }) => {
    //         return commands.setMark(this.name, attributes);
    //       },
    //     toggleSpace:
    //       (attributes) =>
    //       ({ commands }) => {
    //         return commands.toggleMark(this.name, attributes);
    //       },
    //     unsetSpace:
    //       () =>
    //       ({ commands }) => {
    //         return commands.unsetMark(this.name);
    //       },
    //   };
    // },
    // addProseMirrorPlugins(this) {
    //   return [
    //     new Plugin({
    //       props: {
    //         handleClick: (view, pos, event) => {
    //           const { schema, doc, tr } = view.state;
    //           if (pos < 0 || pos > doc.content.size) {
    //             return false;
    //           }
    //           const range = getMarkRange(
    //             doc.resolve(pos),
    //             schema.marks.Character
    //           );
    //           if (!range) return false;

    //           const [$start, $end] = [
    //             doc.resolve(range.from),
    //             doc.resolve(range.to),
    //           ];

    //           view.dispatch(tr.setSelection(new TextSelection($start, $end)));

    //           charClick();
    //           return true;
    //         },
    //       },
    //     }),
    //   ];
    // },
  });
export declare const Highlight: Mark<optionType, any>;
