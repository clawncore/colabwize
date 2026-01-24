import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

/**
 * Enhanced document content extractor
 * Properly extracts text content from Tiptap editor JSON with metadata
 */
export class DocumentExtractor {
  /**
   * Extract clean text from editor content
   */
  static extractText(content: any): string {
    if (!content) return "";

    try {
      // If it's already a string, return as-is
      if (typeof content === "string") {
        return content;
      }

      // Generate HTML from JSON content
      const html = generateHTML(content, [
        StarterKit
      ]);

      // Convert HTML to clean text
      const div = document.createElement("div");
      div.innerHTML = html;

      // Remove extra whitespace and normalize
      return div.textContent?.replace(/\s+/g, ' ').trim() || "";
    } catch (error) {
      console.error("Failed to extract text:", error);
      return "";
    }
  }

  /**
   * Extract text with positional metadata for citation analysis
   * Mapped to ProseMirror document positions to ensure accurate highlighting
   */
  static extractTextWithPositions(content: any): {
    fullText: string;
    citations: Array<{
      text: string;
      position: number; // ProseMirror position (anchor.start)
      endPosition: number; // ProseMirror position (anchor.end)
      type: "numeric" | "author_year" | "author_page";
    }>;
    sections: Array<{
      title: string;
      start: number;
      end: number;
      type: "heading" | "body" | "reference";
    }>;
  } {
    const result = {
      fullText: "",
      citations: [] as Array<{ text: string; position: number; endPosition: number; type: "numeric" | "author_year" | "author_page" }>,
      sections: [] as Array<{ title: string; start: number; end: number; type: "heading" | "body" | "reference" }>
    };

    if (!content || !content.content) return result;

    // We need to map linear text index -> ProseMirror position
    // ProseMirror positions include node tags (1 unit each for open/close)
    const textIndexToPmPos: number[] = [];

    // Start at 0. If content is the 'doc' node, the first child starts at 1?
    // In Tiptap JSON, the top level object IS the doc. 
    // The positions inside the editor usually start with 0 at the very start of the doc?
    // Actually, Doc start is 0. First block starts at 0 (node pos) but content inside is 1.
    // Let's assume we start tracking at position 0 (start of doc).
    // But we iterate content. So we are inside the doc.
    let currentPmPosition = 0;

    // We assume the root "doc" consumes 0..size. But the content array is inside it.
    // The first child of doc starts at position 0 relative to doc content? 
    // No, standard PM: Doc is a node. It has content.
    // If we are passing `editor.state.doc.toJSON()`, we are processing the DOC node.
    // So currentPmPosition should technically start at 0, and we increment for children.

    // Correct logic:
    // If we are iterating `doc.content`, we are at position 0 inside the doc.
    // Each child node N:
    //   Starts at `currentPmPosition`.
    //   If it's a block, it takes 1 unit for opening. Content starts at `currentPmPosition + 1`.
    //   ... content ...
    //   It takes 1 unit for closing.
    //   Next sibling starts after that.

    let currentSection: { title: string; start: number; end: number; type: "heading" | "body" | "reference" } = {
      title: "Introduction",
      start: 0,
      end: 0,
      type: "body"
    };

    const traverseNode = (node: any) => {
      if (!node) return;

      const isText = node.type === "text";
      const hasContent = node.content && Array.isArray(node.content);

      if (isText) {
        if (node.text) {
          const textStr = node.text;
          const startTextIndex = result.fullText.length;
          const startPmPos = currentPmPosition;

          result.fullText += textStr;

          // Map every character in this text node to its PM position
          for (let i = 0; i < textStr.length; i++) {
            textIndexToPmPos[startTextIndex + i] = startPmPos + i;
          }

          currentPmPosition += textStr.length;
        }
      } else if (hasContent) {
        // Container Node (Paragraph, Heading, Lists, Blockquote, etc.)
        currentPmPosition += 1; // Opening Token

        // --- Metadata Extraction for Headings ---
        if (node.type === "heading") {
          if (currentSection.start < currentPmPosition) {
            currentSection.end = currentPmPosition;
            result.sections.push({ ...currentSection });
          }

          const headingText = this.extractTextFromNode(node);
          const isReferenceSection = this.isReferenceHeading(headingText);

          currentSection = {
            title: headingText,
            start: currentPmPosition,
            end: 0,
            type: isReferenceSection ? "reference" : "heading"
          } as any;
        }

        // Recurse
        node.content.forEach((child: any) => traverseNode(child));

        currentPmPosition += 1; // Closing Token
      } else {
        // Leaf Node (Image, HardBreak, HorizontalRule, CodeBlock without content, etc.)
        // These take up 1 unit in ProseMirror document model
        currentPmPosition += 1;
      }
    };

    // Begin traversal of the DOC content
    content.content.forEach((node: any) => traverseNode(node));

    // Close final section
    currentSection.end = currentPmPosition;
    result.sections.push(currentSection);

    // --- Post-Processing: Find Citations and Map Positions ---

    // Now we run the regex on the fullText and use textIndexToPmPos to map back
    const findCitationsInFullText = () => {
      // 1. Numeric: [1], [1, 2], [1-5]
      const numericRegex = /\[\s*\d+(?:[\s,\-]+\d+)*\s*\]/g;

      // 2. Broad Parenthetical with Year: (Smith, 2020), (Smith 2020 p.5), (e.g., Smith 2020)
      // Catches ANYTHING in parentheses that contains a 4-digit year 1900-2099
      const authorYearRegex = /\([^)]*\b(?:19|20)\d{2}\b[^)]*\)/g;

      // 3. Author-Page: (Johnson 23), (Johnson, p. 23) - if not caught by above (no year)
      // Look for (Name Number) where number is NOT a year
      const authorPageRegex = /\([A-Z][a-zA-Z\s.&]+\s+\d{1,4}(?:-\d+)?\)/g;

      const regexes = [
        { r: numericRegex, type: "numeric" },
        { r: authorYearRegex, type: "author_year" },
        { r: authorPageRegex, type: "author_page" }
      ];

      regexes.forEach(({ r, type }) => {
        let match;
        // Reset lastIndex for safety if reused
        r.lastIndex = 0;

        while ((match = r.exec(result.fullText)) !== null) {
          const textIndexStart = match.index;
          const textIndexEnd = match.index + match[0].length;

          // Map to PM Position
          // Guard against missing map entries (e.g. if regex matched across boundaries in weird ways)
          // In generic text matching, match might span nodes.
          // startPmPos is strictly map[start].
          // endPmPos is strictly map[end - 1] + 1.

          const pmStart = textIndexToPmPos[textIndexStart];
          // For the end, we want the position AFTER the last character.
          // The last character is at textIndexEnd - 1.
          // Its PM pos is textIndexToPmPos[textIndexEnd - 1].
          // So end is that + 1.
          const lastCharPmPos = textIndexToPmPos[textIndexEnd - 1];

          if (pmStart !== undefined && lastCharPmPos !== undefined) {
            result.citations.push({
              text: match[0],
              position: pmStart,
              endPosition: lastCharPmPos + 1,
              type: type as any
            });
          }
        }
      });
    };

    findCitationsInFullText();

    return result;
  }

  /**
   * Find citations in text with their positions
   */
  private static findCitations(text: string, basePosition: number): Array<{
    text: string;
    position: number;
    type: string;
  }> {
    const citations: Array<{ text: string; position: number; type: string }> = [];

    // Numeric bracket citations [1], [12], [1, 2]
    const numericRegex = /\[\s*\d+(?:[\s,\-]+\d+)*\s*\]/g;
    let match;

    while ((match = numericRegex.exec(text)) !== null) {
      citations.push({
        text: match[0],
        position: basePosition + match.index,
        type: "numeric"
      });
    }

    // Author-year citations (Smith, 2023), (Smith & Jones, 2023), (Stuart Russell et al., 1995)
    // Broader regex to catch names with special chars like &, ; and et al.
    const authorYearRegex = /\([A-Z][^)]+?\d{4}[a-z]?\)/g;

    while ((match = authorYearRegex.exec(text)) !== null) {
      citations.push({
        text: match[0],
        position: basePosition + match.index,
        type: "author_year"
      });
    }

    // Author-page citations (Smith 24)
    const authorPageRegex = /\([A-Z][a-zA-Z\s\.\-']+\s+\d+(?:-\d+)?\)/g;

    while ((match = authorPageRegex.exec(text)) !== null) {
      citations.push({
        text: match[0],
        position: basePosition + match.index,
        type: "author_page"
      });
    }

    return citations;
  }

  /**
   * Extract text from a single node
   */
  private static extractTextFromNode(node: any): string {
    if (!node) return "";

    if (node.text) return node.text;

    if (node.content) {
      return node.content.map((child: any) => this.extractTextFromNode(child)).join("");
    }

    return "";
  }

  /**
   * Check if heading indicates reference/bibliography section
   */
  private static isReferenceHeading(text: string): boolean {
    if (!text) return false;

    const lowerText = text.toLowerCase().trim();
    return [
      "references",
      "works cited",
      "bibliography",
      "reference list",
      "cited works"
    ].includes(lowerText);
  }

  /**
   * Get document statistics
   */
  static getDocumentStats(content: any): {
    wordCount: number;
    characterCount: number;
    citationCount: number;
    sectionCount: number;
  } {
    const extracted = this.extractTextWithPositions(content);

    return {
      wordCount: extracted.fullText.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: extracted.fullText.length,
      citationCount: extracted.citations.length,
      sectionCount: extracted.sections.length
    };
  }

  /**
   * Validate document structure for citation audit
   */
  static validateForAudit(content: any): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!content || !content.content) {
      issues.push("Document is empty");
      return { isValid: false, issues };
    }

    const stats = this.getDocumentStats(content);

    if (stats.wordCount < 100) {
      issues.push("Document is too short for meaningful citation analysis");
    }

    if (stats.citationCount === 0) {
      issues.push("No citations found in document");
    }

    // Check for reference section
    const extracted = this.extractTextWithPositions(content);
    const hasReferenceSection = extracted.sections.some(
      section => section.type === "reference"
    );

    if (!hasReferenceSection) {
      issues.push("No reference/bibliography section found");
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}