
/**
 * Utility functions for document handling
 */

/**
 * Extracts plain text from a Tiptap/ProseMirror JSON content object
 * @param content The content object or string
 * @param maxLength Optional max length for the returned string (default: no limit)
 * @returns The extracted plain text or null if extraction fails
 */
export const extractTextFromContent = (content: any, maxLength: number = 0): string | null => {
    if (!content) return null;

    try {
        let contentObj = content;

        // Handle stringified JSON (potentially multiple levels)
        if (typeof contentObj === 'string') {
            try {
                const parsed = JSON.parse(contentObj);
                // If parsing resulted in an object or array, use it.
                // If it resulted in a string, it might be double-stringified.
                if (typeof parsed === 'object') {
                    contentObj = parsed;
                } else if (typeof parsed === 'string') {
                    // Try parsing one more time for double-stringified content
                    try {
                        const doubleParsed = JSON.parse(parsed);
                        if (typeof doubleParsed === 'object') {
                            contentObj = doubleParsed;
                        }
                    } catch {
                        // Second parse failed, stick with the first parsed string if meaningful
                        contentObj = parsed;
                    }
                }
            } catch {
                // Not a JSON string, treat as plain text
                // If it's a simple string, treat it as text
                return maxLength && contentObj.length > maxLength
                    ? contentObj.substring(0, maxLength) + "..."
                    : contentObj;
            }
        }

        // Check if it's a valid Tiptap doc
        if (contentObj && contentObj.type === "doc" && Array.isArray(contentObj.content)) {
            let text = "";

            const traverse = (node: any) => {
                if (!node) return;

                // Add space between blocks
                if (text.length > 0 && text[text.length - 1] !== ' ') {
                    text += " ";
                }

                if (node.type === "text" && node.text) {
                    text += node.text;
                } else if (node.content && Array.isArray(node.content)) {
                    node.content.forEach((child: any) => traverse(child));
                }
            };

            contentObj.content.forEach((node: any) => traverse(node));

            text = text.trim();

            if (text.length === 0) return null;

            if (maxLength > 0 && text.length > maxLength) {
                return text.substring(0, maxLength) + "...";
            }
            return text;
        }

        // If we have an object but it's not a doc, maybe it has some other structure?
        // For now, return null to fallback to description
        return null;
    } catch (err) {
        console.error("Error extracting text from content:", err);
        return null;
    }
};
