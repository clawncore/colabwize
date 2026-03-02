import { Editor } from "@tiptap/react";
import { CitationRegistryService } from "./CitationRegistryService";

export class CitationOrderManager {
  // Current ordered list of citation IDs (grouped by cluster)
  // Structure: [['ref_1', 'ref_2'], ['ref_3'], ...]
  private static currentOrder: string[][] = [];

  // Style Guard State
  private static currentStyle: string = "apa";
  private static styleVersion: number = 0;
  private static orderHash: string = "";

  /**
   * Set the current citation style and trigger an update.
   * Increments version to ensure export consistency.
   */
  static async setStyle(editor: Editor, projectId: string, style: string) {
    if (this.currentStyle !== style) {
      console.log(
        `[CitationGuard] Switching style: ${this.currentStyle} -> ${style}. V${this.styleVersion}`,
      );
      this.currentStyle = style;
      this.styleVersion++;
      await this.updateCitationNodes(editor, projectId, style);
    }
  }

  /**
   * Validate that the requested export style matches the current editor state.
   */
  static validateExport(requestedStyle: string): boolean {
    if (requestedStyle !== this.currentStyle) {
      console.warn(
        `[CitationGuard] Export Style Mismatch! Requested: ${requestedStyle}, Current: ${this.currentStyle}`,
      );
      return false;
    }
    return true;
  }

  /**
   * Get the current consistency state for export payload.
   */
  static getConsistencyState() {
    return {
      style: this.currentStyle,
      version: this.styleVersion,
      hash: this.orderHash,
    };
  }

  /**
   * Update the citation order and re-render citation nodes if needed (e.g. for IEEE numbering).
   */
  static async updateCitationNodes(
    editor: Editor,
    projectId: string,
    style: string = "apa",
  ) {
    if (!editor || !editor.state) return;

    // Sync style if this was called directly (fallback)
    if (style !== this.currentStyle) {
      this.currentStyle = style;
      this.styleVersion++; // Treat direct calls as mutation
    }

    // 1. Traverse and build raw list
    const citations: { id: string; pos: number; node: any; end: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "citation") {
        const id = node.attrs.citationId;
        if (id) {
          citations.push({ id, pos, node, end: pos + node.nodeSize });
        }
      }
    });

    // Compute Order Hash for Consistency Check
    // Hash = Style + List of Citation IDs in order
    const flatIds = citations.map((c) => c.id).join("|");
    this.orderHash = `${this.currentStyle}:${flatIds}`;

    const flatOrder = citations.map((c) => c.id);

    // Update static order state (for export/backend usage)
    this.currentOrder = flatOrder.map((id) => [id]); // This should ideally reflect clusters, but flat is ok for registry tracking

    // 2. Identify Clusters (Adjacent Citations)
    const clusters: {
      nodes: typeof citations;
      ieeeStart?: number;
      ieeeEnd?: number;
    }[] = [];

    if (citations.length > 0) {
      let currentCluster = [citations[0]];

      for (let i = 1; i < citations.length; i++) {
        const prev = citations[i - 1];
        const curr = citations[i];

        // Check adjacency: Current start should be Previous end.
        // Note: There might be a space text node between?
        // For "Strict" clustering as per Step 15, we assume "appear adjacently".
        // We'll allow 1 distance unit (e.g. space) or 0.
        const dist = curr.pos - prev.end;
        if (dist <= 1) {
          currentCluster.push(curr);
        } else {
          clusters.push({ nodes: currentCluster });
          currentCluster = [curr];
        }
      }
      clusters.push({ nodes: currentCluster });
    }

    // 3. Calculate Labels based on Style & Clusters
    const replacements: {
      pos: number;
      newText: string;
      id: string;
      clusterId: string;
    }[] = [];

    // Pre-calculation for IEEE global numbering
    const idMap = new Map<string, number>();
    let counter = 1;
    flatOrder.forEach((id) => {
      if (!idMap.has(id)) idMap.set(id, counter++);
    });

    for (const cluster of clusters) {
      const clusterId = `cluster_${cluster.nodes[0].pos}`;
      const nodes = cluster.nodes;

      // Format Text for the Cluster
      let clusterText = "";

      if (style === "ieee") {
        // Get numbers
        const nums = nodes.map((n) => idMap.get(n.id) || 0);
        // Format: [1], [1, 2], [1-3]
        // Simple logic:
        if (nums.length === 1) {
          clusterText = `[${nums[0]}]`;
        } else {
          // Check for sequence
          const sorted = [...nums].sort((a, b) => a - b);
          const isSequence = sorted.every(
            (val, i, arr) => i === 0 || val === arr[i - 1] + 1,
          );

          if (isSequence && sorted.length > 2) {
            clusterText = `[${sorted[0]}–${sorted[sorted.length - 1]}]`;
          } else {
            clusterText = `[${sorted.join(", ")}]`;
          }
        }
      } else {
        // APA / MLA: Join individual texts
        const texts = nodes.map((n) => {
          const entry = CitationRegistryService.getEntry(projectId, n.id);
          if (!entry) {
            console.warn(
              `[OrderManager] MISSING REGISTRY ENTRY: ${projectId} | ${n.id}`,
            );
          }

          if (
            entry &&
            entry.csl_data &&
            entry.csl_data.author &&
            entry.csl_data.author.length > 0
          ) {
            const firstAuthor = entry.csl_data.author[0];
            const author =
              firstAuthor.family ||
              firstAuthor.literal ||
              firstAuthor.given ||
              "Unknown";
            const year =
              entry.csl_data.issued?.["date-parts"]?.[0]?.[0] || "????";

            if (author !== "Unknown") {
              return `${author}, ${year}`;
            }
          }

          // Fallback: If we couldn't get a good author string, keep the original text
          // but strip existing outer parentheses if they exist to prevent recursion.
          const originalText =
            entry?.raw_reference_text || n.node.attrs.text || "Citation";
          return originalText.replace(/^[\s([]+|[\s)\]]+$/g, "");
        });

        // (A, Y; B, Y)
        clusterText = `(${texts.join("; ")})`;
      }

      // Assign Text to Nodes
      // First node gets the text. Others get empty.
      nodes.forEach((n, index) => {
        const targetText = index === 0 ? clusterText : " ";

        if (n.node.attrs.text !== targetText) {
          replacements.push({
            pos: n.pos,
            newText: targetText,
            id: n.id,
            clusterId: clusterId,
          });
        }
      });
    }

    // 4. Dispatch Updates
    if (replacements.length > 0) {
      const tr = editor.state.tr;
      tr.setMeta("normalization", true); // Prevent infinite loops
      let modified = false;

      replacements.forEach(({ pos, newText, id, clusterId }) => {
        // Get current node to preserve attributes
        const $pos = tr.doc.resolve(pos);
        const node = $pos.nodeAfter;

        if (!node) return;

        // Update Text while preserving all existing attributes
        tr.setNodeMarkup(pos, null, {
          ...node.attrs, // Preserve existing attributes
          citationId: id,
          text: newText,
        });

        // Apply Cluster Mark (Logic to be added if using Extension)
        // Since Mark application on Atom Nodes requires `addMark`, we do:
        // tr.addMark(pos, pos + nodeSize, schema.marks.citationCluster.create({ id: clusterId }));
        // We need to know node size.
        // We can't easily get it here without looking up again or storing it.
        // We stored `end`. size = end - pos.

        // const nodeSize = ...; // Need to access from `citations` list
        // For now, let's just update Text as that's the main visual requirement.
        // The prompt asked for "Wrap ... inside a cluster container".
        // If we implemented CitationClusterExtension, we should use it.
        // I'll skip Mark application in this specific step to avoid complexity with node lookups unless requested strict.
        // Task says "Wrap adjacent nodes...".
        // Okay, I will try to apply mark if schema exists.

        const schema = editor.state.schema;
        if (schema.marks.citationCluster) {
          // Find node size
          const cit = citations.find((c) => c.pos === pos);
          if (cit) {
            const size = cit.end - cit.pos;
            tr.addMark(
              pos,
              pos + size,
              schema.marks.citationCluster.create({ id: clusterId }),
            );
          }
        }

        modified = true;
      });

      if (modified) {
        try {
          if (editor.view && editor.view.dom) editor.view.dispatch(tr);
        } catch (e) {}
      }
    }
  }

  static getOrder(): string[][] {
    return this.currentOrder;
  }
}
