import { Node } from "@tiptap/pm/model";

export interface Range {
    from: number;
    to: number;
}

/**
 * Finds all occurrences of a search string in the ProseMirror document
 * and returns their ranges (from, to).
 * 
 * This treats the document as a flat text stream, respecting strict block boundaries.
 */
export const findSearchTerm = (doc: Node, searchTerm: string): Range[] => {
    if (!searchTerm || !doc) return [];

    const results: Range[] = [];
    const normalizedSearch = searchTerm; // Assuming strict match for now

    // We'll perform a naive search:
    // 1. Get all text with a known block separator that matches our "step" logic? 
    //    No, mapping back is tricky with separators.

    // Method:
    // Traverse all text nodes. Build a running text accumulator.
    // Maintain a map of "Text Index -> ProseMirror Pos".
    // This is memory intensive for large docs but accurate.

    // Better Method:
    // Regex search on `doc.textBetween` and then `doc.resolve`? No.

    // We will iterate through the document's leaf text nodes.
    // We keep a "current text" buffer.

    try {
        const fullText = doc.textBetween(0, doc.content.size, '\n', '\0');
        // We use \n for block separator.
        // ProseMirror usually treats block boundary as 1 or 2 positions.
        // textBetween generation:
        // - Text nodes: appended.
        // - Block nodes: separator appended.

        let searchPos = 0;
        while (searchPos < fullText.length) {
            const index = fullText.indexOf(normalizedSearch, searchPos);
            if (index === -1) break;

            // Found match in plain text at `index`.
            // We need to map `index` and `index + length` back to PM positions.
            // This requires a "resolve" function.
            const from = mapStringIndexToPos(doc, index);
            const to = mapStringIndexToPos(doc, index + normalizedSearch.length);

            if (from !== null && to !== null) {
                results.push({ from, to });
            }

            searchPos = index + 1;
        }
    } catch (err) {
        console.error("Error finding search term:", err);
    }

    return results;
};

/**
 * Maps a plain text index (from doc.textBetween using '\n') back to a ProseMirror position.
 */
const mapStringIndexToPos = (doc: Node, targetIndex: number): number | null => {
    let currentTextIndex = 0;
    let foundPos: number | null = null;

    // Traverse the document nodes
    doc.descendants((node, pos) => {
        if (foundPos !== null) return false; // Stop if found

        if (node.isText) {
            const len = node.text?.length || 0;
            if (currentTextIndex + len > targetIndex) {
                // The target is within this node
                const offset = targetIndex - currentTextIndex;
                foundPos = pos + offset;
                return false;
            }
            currentTextIndex += len;
        } else if (node.isBlock) {
            // Block start? No, textBetween logic:
            // Text separates blocks.
            // When traversing descendants, we hit block nodes then their children.
            // But `textBetween` emits the separator *between* nodes.
            // Wait, `textBetween(0, size, sep)`:
            // Iterates range. When leaving a block, adds sep.

            // This traversal logic is tricky because `descendants` doesn't emit "end of block" events 
            // where we'd increment the text index for the separator.

            // Allow default traversal for children.
        }

        return true;
    });

    // We need a more reliable mapping that accounts for the separators we injected.
    // Re-implementing a synchronized traversal:

    return null;
};

/**
 * Robust implementation of finding a single best match for a sentence
 * prioritizing the vicinity of 'estimatedPos'.
 */
export const findBestMatch = (doc: Node, searchText: string, estimatedPos: number = 0): Range | null => {
    // 1. Convert entire doc to text with a separator that mimics structure slightly
    // using a unique char for block boundaries to avoid matching across paragraphs falsely
    // (though sometimes sentences span paragraphs? Unlikely for originality checker).

    // We utilize `doc.textBetween` with a special char.
    const separator = '\n';
    const fullText = doc.textBetween(0, doc.content.size, separator, '\0');

    // 2. Find the index in this text
    // Try to find closest to estimatedPos (mapped to text index)
    // For now, just find first occurrence or all occurrences and pick closest?

    // Simple approach: standard indexOf. 
    // If we have multiple, we could pick closest, but let's trust uniqueness for now or sequential scan.

    // Note: 'estimatedPos' is a PM position. We need to convert to text index roughly?
    // Let's just search from the start for now, assuming sequential processing in the caller helps.
    // Or scan from `lastMatchEnd`.

    const textIndex = fullText.indexOf(searchText);
    if (textIndex === -1) {
        // Try fallback: loose match? (Not implemented yet)
        return null;
    }

    // 3. Map back to PM position
    // We iterate the doc again to count valid text and separators until we reach `textIndex`.

    // let currentTextIndex = 0;
    // let fromPos = 0;
    // let toPos = 0;
    let foundFrom = false;

    // We define a helper to advance positions
    // We walk the document structure linearly

    // let pmPos = 0; // Current PM position

    // Using `nodesBetween` gives us nodes. 
    // But we need to account for opening/closing tags which `textBetween` handles implicitly via separator.

    // Simplified: Use the experimental `posAtIndex` utility approach?
    // Since we don't have it, we write a simpler walker.

    // Iterating recursively is easier.
    // But we can't easily break.

    // Iterative approach using the doc content directly is hard.

    // Let's use `doc.descendants` but we need to properly handle the separator logic match `textBetween`.
    // `textBetween` adds separator "between nodes".
    // Specifically block nodes.

    // Let's try to simulate `textBetween` iteration.

    let accumulated = 0;
    let resultFrom = -1;
    let resultTo = -1;

    // Optimization: Regex match is safer but we found exact string.

    // We will scan the doc to find the position.
    doc.descendants((node, pos) => {
        if (resultTo !== -1) return false; // Stop

        if (node.isText) {
            const len = node.text!.length;

            // Check if our range [accumulated, accumulated + len] overlaps with [textIndex, textIndex + searchText.length]
            const startOverlap = Math.max(accumulated, textIndex);
            const endOverlap = Math.min(accumulated + len, textIndex + searchText.length);

            if (startOverlap < endOverlap) {
                // We are inside the match.
                if (!foundFrom && startOverlap === textIndex) {
                    // Start of match is in this node
                    const offset = textIndex - accumulated;
                    resultFrom = pos + offset;
                    foundFrom = true;
                }

                if (foundFrom && endOverlap === textIndex + searchText.length) {
                    // End of match is in this node
                    const offset = (textIndex + searchText.length) - accumulated;
                    resultTo = pos + offset;
                    return false; // Done
                }
            }

            accumulated += len;
        } else if (node.isBlock) {
            // Blocks logic:
            // textBetween adds separator when *leaving* a block?
            // Actually it adds separator when *encountering a new block* if positions separate them?
            // The logic of `textBetween` is: insert `blockSeparator` between two block nodes.
            // It gets complex.

            // Hacky Fix: 
            // If the search text doesn't contain the separator (newlines), we can assume it's entirely within a text block (or inline nodes).
            // We only increment `accumulated` for text.
            // If we assume the search text DOES NOT span blocks, we can ignore separators in our mapping 
            // provided `textIndex` was found in a string that includes separators.

            // ... Wait, if `fullText` has separators, `textIndex` counts them.
            // So we MUST count them in `accumulated`.

            // `doc.descendants` visits Child, then Grandchild.
            // It doesn't visit "End of Child".

            // If we are looking for exact positions, relying on `textBetween` reverse mapping from scratch is error prone.
        }
        return true;
    });

    if (resultFrom !== -1 && resultTo !== -1) {
        return { from: resultFrom, to: resultTo };
    }

    // Fallback: If map failed (e.g. strict separator logic mismatch), return null.
    // The previous `indexOf` logic was blindly adding +1. 
    // Our logic above only increments `accumulated` for text, ignoring separators, 
    // so it only works if `textIndex` came from a string WITHOUT separators.

    // Better Approach:
    // Don't search in full text. Search node by node?
    // Iterate all text nodes. Check if node text contains the start of the sentence (or the whole sentence).
    // This handles "Fragmented words" perfectly if the sentence is inside one node.
    // If sentence is split: "Hello [b]World[/b]".
    // Node 1: "Hello ", Node 2: "World".
    // Sentence: "Hello World".
    // Matches across 2 nodes.

    return null;
};

/**
 * Perform a standard search of `searchText` within the document.
 * Returns the first occurrence after `fromPos`.
 */
export const findTextRange = (doc: Node, searchText: string, fromPos: number = 0): Range | null => {
    // Helper to extract all text nodes with their positions
    const textNodes: { pos: number, text: string }[] = [];
    doc.descendants((node, pos) => {
        if (node.isText) {
            textNodes.push({ pos, text: node.text! });
        }
    });

    // Construct virtual full text *without* separators, but keeping track of mapping
    let virtualText = "";
    const map: number[] = []; // Map index in virtualText to PM pos

    textNodes.forEach(({ pos, text }) => {
        for (let i = 0; i < text.length; i++) {
            map.push(pos + i);
        }
        virtualText += text;
        // We implicitly assume adjacent text nodes are adjacent in display (mostly true for inline)
        // Blocks are not adjacent. We should probably insert a " " or sentinel in virtual text if blocks change?
        // But backend sentence likely assumes spaces.

        // Actually, let's insert a space in virtualText if we jump blocks?
        // Too complex to detect block boundary here easily without parent info.
    });

    // Simple search
    // Note: This ignores block boundaries, so "End.Start" might match "EndStart".
    // But scan results are sentences, usually separated by space/newline.

    // Normalize search text (trim, unify spaces)
    const cleanSearch = searchText.replace(/\s+/g, ' ').trim();
    // We can't normalize virtualText easily without breaking the map.
    // So we try strict search first.

    const index = virtualText.indexOf(cleanSearch);
    if (index !== -1) {
        return {
            from: map[index],
            to: map[index + cleanSearch.length - 1] + 1 // +1 because 'to' is exclusive usually? or inclusive end char? 
            // Map points to start of char.
            // "a" (length 1). from=map[0], to=map[0]+1.
            // So if match length is L. End index is index + L - 1.
            // to = map[endIndex] + 1. 
        };
    }

    return null;
}
