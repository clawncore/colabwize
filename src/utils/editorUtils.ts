/**
 * Utility functions for editor content validation and sanitization
 */

interface Node {
  type: string;
  content?: Node[];
  text?: string;
  attrs?: Record<string, any>;
}

/**
 * Recursively validates and cleans editor content to remove empty text nodes
 * and ensure compatibility with Tiptap schema
 */
export function validateAndCleanContent(content: any): any {
  if (!content) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Start writing your document here...",
            },
          ],
        },
      ],
    };
  }

  // If content is a string
  if (typeof content === "string") {
    // If it looks like HTML, return as is
    if (content.trim().startsWith("<")) {
      return content;
    }

    // Otherwise wrap plain text in a paragraph
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        },
      ],
    };
  }

  // If content is already in the correct format
  if (content.type === "doc" && Array.isArray(content.content)) {
    return {
      ...content,
      content: content.content.map(cleanNode).filter(Boolean),
    };
  }

  // If content is an array of nodes
  if (Array.isArray(content)) {
    return {
      type: "doc",
      content: content.map(cleanNode).filter(Boolean),
    };
  }

  // Return default if content format is unrecognized
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Start writing your document here...",
          },
        ],
      },
    ],
  };
}

/**
 * Cleans a single node recursively
 */
function cleanNode(node: any): any {
  if (!node || typeof node !== "object") {
    return null;
  }

  // Remove empty text nodes
  if (
    node.type === "text" &&
    (node.text === undefined || node.text === null || node.text === "")
  ) {
    return null;
  }

  // Process content if it exists
  if (node.content && Array.isArray(node.content)) {
    const cleanedContent = node.content.map(cleanNode).filter(Boolean); // Remove null values

    return {
      ...node,
      content: cleanedContent,
    };
  }

  return node;
}

/**
 * Formats content specifically for Tiptap editor insertion
 */
export function formatContentForTiptap(content: any): any {
  const cleaned = validateAndCleanContent(content);

  // If it's an HTML string, return as is
  if (typeof cleaned === "string") {
    return cleaned;
  }

  // Additional validation to ensure proper structure for JSON content
  if (!cleaned.content || cleaned.content.length === 0) {
    cleaned.content = [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Start writing your document here...",
          },
        ],
      },
    ];
  }

  return cleaned;
}
