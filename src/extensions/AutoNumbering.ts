import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AutoNumberingKey = new PluginKey("autoNumbering");

export const AutoNumbering = Extension.create({
    name: "autoNumbering",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: AutoNumberingKey,

                appendTransaction(transactions, oldState, newState) {
                    // Only run if the document actually changed
                    const docChanged = transactions.some(tr => tr.docChanged);
                    if (!docChanged) return null;

                    const tr = newState.tr;
                    let modified = false;

                    // Counter for figures and tables
                    let figureCount = 0;
                    let tableCount = 0;

                    // Scan the entire document
                    newState.doc.descendants((node, pos) => {
                        // Handle figure nodes
                        if (node.type.name === "figure") {
                            figureCount++;
                            const currentNumber = node.attrs.figureNumber;

                            if (currentNumber !== figureCount) {
                                // Update the figure number
                                tr.setNodeMarkup(pos, null, {
                                    ...node.attrs,
                                    figureNumber: figureCount,
                                });
                                modified = true;
                            }
                        }

                        // Handle table nodes
                        if (node.type.name === "table") {
                            tableCount++;
                            const currentNumber = node.attrs.tableNumber;

                            if (currentNumber !== tableCount) {
                                // Update the table number
                                tr.setNodeMarkup(pos, null, {
                                    ...node.attrs,
                                    tableNumber: tableCount,
                                });
                                modified = true;
                            }
                        }
                    });

                    return modified ? tr : null;
                },
            }),
        ];
    },
});

export default AutoNumbering;
