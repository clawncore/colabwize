import { Mark, mergeAttributes, getMarkRange } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface PlaceholderMarkOptions {
    HTMLAttributes: Record<string, any>;
}

export const PlaceholderMarkExtension = Mark.create<PlaceholderMarkOptions>({
    name: "placeholder",

    addOptions() {
        return {
            HTMLAttributes: {
                class: "template-placeholder-text",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span.template-placeholder-text",
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

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("placeholder-clear-on-focus"),
                appendTransaction: (transactions, oldState, newState) => {
                    const { selection } = newState;
                    const { $from } = selection;

                    // Optimization: Only run if selection changed or content changed
                    if (!transactions.some((tr) => tr.selectionSet || tr.docChanged))
                        return null;

                    const markType = newState.schema.marks[this.name];
                    if (!markType) return null;

                    // Determine if we need to remove the placeholder
                    // Check current position
                    let rangeToDelete = getMarkRange($from, markType);

                    // If not found directly, check the position before (boundary case)
                    // This handles the case where cursor is exactly at the end of the placeholder mark
                    if (!rangeToDelete && $from.pos > 0) {
                        try {
                            const $prevPos = newState.doc.resolve($from.pos - 1);
                            rangeToDelete = getMarkRange($prevPos, markType);
                        } catch (e) {
                            // Ignore boundary errors
                        }
                    }

                    if (rangeToDelete) {
                        // Verify we are actually interacting with it
                        // We verify range is valid and has the mark
                        const doc = newState.doc;
                        if (
                            rangeToDelete.from < rangeToDelete.to &&
                            doc.rangeHasMark(
                                rangeToDelete.from,
                                rangeToDelete.to,
                                markType
                            )
                        ) {
                            // Explicitly check for valid document positions to prevent RangeError
                            if (rangeToDelete.from >= 0 && rangeToDelete.to <= doc.content.size) {
                                return newState.tr.delete(rangeToDelete.from, rangeToDelete.to);
                            }
                        }
                    }

                    return null;
                },
            }),
        ];
    },
});
