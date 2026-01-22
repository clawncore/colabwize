import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        columnLayout: {
            /**
             * Toggle the column layout
             */
            toggleColumnLayout: (attributes?: { columns: number }) => ReturnType;
            /**
             * Set the column layout
             */
            setColumnLayout: (attributes?: { columns: number }) => ReturnType;
            /**
             * Unset the column layout
             */
            unsetColumnLayout: () => ReturnType;
        };
    }
}

export const ColumnLayoutExtension = Node.create({
    name: "columnLayout",

    group: "block",

    content: "block+",

    defining: true,

    addAttributes() {
        return {
            columns: {
                default: 2,
                parseHTML: (element) => parseInt(element.getAttribute("data-columns") || "2", 10),
                renderHTML: (attributes) => ({
                    "data-columns": attributes.columns,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[class="columns-wrapper"]',
            },
            {
                tag: 'div[data-columns]',
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, { class: "columns-wrapper" }),
            0,
        ];
    },

    addCommands() {
        return {
            setColumnLayout:
                (attributes = { columns: 2 }) =>
                    ({ commands }) => {
                        return commands.wrapIn(this.name, attributes);
                    },
            toggleColumnLayout:
                (attributes = { columns: 2 }) =>
                    ({ commands }) => {
                        return commands.toggleWrap(this.name, attributes);
                    },
            unsetColumnLayout:
                () =>
                    ({ commands }) => {
                        return commands.lift(this.name);
                    },
        };
    },
});
