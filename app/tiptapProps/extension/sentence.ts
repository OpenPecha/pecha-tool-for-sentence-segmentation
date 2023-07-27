import { Mark, mergeAttributes } from "@tiptap/core";
export interface optionType {
  multicolor: boolean;
  HTMLAttributes: Record<string, any>;
}

export const Sentence = (charClick) =>
  Mark.create({
    name: "sn",

    addOptions() {
      return {
        multicolor: false,
        HTMLAttributes: {},
      };
    },

    addAttributes() {
      return {
        class: {
          default: "sen",
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: "Sn",
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
