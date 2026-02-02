import { Table } from "@tiptap/extension-table";

/**
 * Enhanced Table extension with automatic numbering support
 * Works with the AutoNumbering plugin to assign sequential table numbers
 * 
 * NOTE: Table caption rendering is complex due to TipTap's table structure.
 * The tableNumber attribute is assigned by AutoNumbering plugin.
 * Caption rendering is handled via CSS or external UI for now.
 */
export const TableWithNumbering = Table.extend({
    name: "table",

    addAttributes() {
        return {
            ...this.parent?.(),
            tableNumber: {
                default: null, // Auto-assigned by AutoNumbering plugin
                parseHTML: element => element.getAttribute('data-table-number'),
                renderHTML: attributes => {
                    if (!attributes.tableNumber) return {};
                    return {
                        'data-table-number': attributes.tableNumber,
                    };
                },
            },
            caption: {
                default: "",
                parseHTML: element => element.getAttribute('data-caption'),
                renderHTML: attributes => {
                    if (!attributes.caption) return {};
                    return {
                        'data-caption': attributes.caption,
                    };
                },
            },
        };
    },
});

export default TableWithNumbering;
