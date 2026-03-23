import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * UserHighlightExtension
 *
 * A standalone mark for user-triggered text highlighting from the editor
 * toolbar. This is COMPLETELY SEPARATE from the OriginaliMap / Citation
 * `citation-highlight` mark and carries no originality-related attributes,
 * CSS classes, or click handlers.
 *
 * Mark name  : "user-highlight"
 * HTML tag   : <mark class="user-highlight" data-color="…">
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    userHighlight: {
      /** Apply a user highlight with the given colour */
      setUserHighlight: (attributes?: { color?: string }) => ReturnType;
      /** Toggle a user highlight with the given colour */
      toggleUserHighlight: (attributes?: { color?: string }) => ReturnType;
      /** Remove user highlight from the selection */
      unsetUserHighlight: () => ReturnType;
    };
  }
}

export const UserHighlightExtension = Mark.create({
  name: "user-highlight",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "user-highlight",
      },
    };
  },

  addAttributes() {
    return {
      color: {
        default: "yellow",
        parseHTML: (el) => el.getAttribute("data-color") || "yellow",
        renderHTML: (attrs) => ({
          "data-color": attrs.color,
          style: `background-color: ${attrs.color}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark.user-highlight",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const el = node as HTMLElement;
          return el.classList.contains("user-highlight") ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setUserHighlight:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),

      toggleUserHighlight:
        (attributes) =>
        ({ commands }) =>
          commands.toggleMark(this.name, attributes),

      unsetUserHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
