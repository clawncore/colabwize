import { Mark, mergeAttributes } from "@tiptap/core";

export interface HighlightOptions {
  HTMLAttributes: Record<string, any>;
}

export interface HighlightAttributes {
  color?: string;
  type?: string;
  similarity?: number;
  aiProbability?: number;
  message?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Set a highlight mark
       */
      setHighlight: (attributes?: HighlightAttributes) => ReturnType;
      /**
       * Toggle a highlight mark
       */
      toggleHighlight: (attributes?: HighlightAttributes) => ReturnType;
      /**
       * Unset a highlight mark
       */
      unsetHighlight: () => ReturnType;
      /**
       * Clear all highlights from the document
       */
      clearAllHighlights: () => ReturnType;
      /**
       * Highlight a specific range directly
       */
      highlightRange: (
        from: number,
        to: number,
        attributes: HighlightAttributes
      ) => ReturnType;
    };
  }
}

export const HighlightExtension = Mark.create<HighlightOptions>({
  name: "highlight",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "highlight",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (node) => {
          const nodeClass =
            typeof node === "string"
              ? node
              : (node as HTMLElement).getAttribute("class");
          return nodeClass?.includes("highlight") ? {} : false;
        },
      },
      {
        style: "background-color",
        getAttrs: (value) => (value === "yellow" ? {} : false),
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

  addAttributes() {
    return {
      color: {
        default: "yellow",
        parseHTML: (element) => element.getAttribute("data-color") || "yellow",
        renderHTML: (attributes) => {
          return {
            "data-color": attributes.color,
          };
        },
      },
      type: {
        default: "originality",
        parseHTML: (element) =>
          element.getAttribute("data-type") || "originality",
        renderHTML: (attributes) => {
          return {
            "data-type": attributes.type,
          };
        },
      },
      similarity: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-similarity") || 0,
        renderHTML: (attributes) => {
          return {
            "data-similarity": attributes.similarity,
          };
        },
      },
      aiProbability: {
        default: 0,
        parseHTML: (element) =>
          element.getAttribute("data-ai-probability") || 0,
        renderHTML: (attributes) => {
          return {
            "data-ai-probability": attributes.aiProbability,
          };
        },
      },
      message: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-message"),
        renderHTML: (attributes) => {
          if (!attributes.message) return {};
          return {
            "data-message": attributes.message,
            title: attributes.message,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      clearAllHighlights:
        () =>
        ({ state, dispatch }) => {
          const { doc } = state;
          const from = 0;
          const to = doc.content.size;

          const transaction = state.tr;

          doc.nodesBetween(from, to, (node, pos) => {
            if (node.marks) {
              const highlightMark = node.marks.find(
                (mark) => mark.type.name === this.name
              );
              if (highlightMark) {
                transaction.removeMark(pos, pos + node.nodeSize, this.type);
              }
            }
          });

          if (transaction.steps.length > 0) {
            dispatch?.(transaction);
            return true;
          }

          return false;
        },
      highlightRange:
        (from: number, to: number, attributes: HighlightAttributes) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.addMark(from, to, this.type.create(attributes));
          }
          return true;
        },
    };
  },
});
