/* eslint-disable */
import { JSONContent } from "@tiptap/core";

export interface SimplifiedAuditResult {
    flags: any[];
    verificationResults: any[];
    integrityIndex: number;
}

export class BibliographyManager {
    /**
     * Extracts all citation IDs from the document and compares them against the 
     * Reference Section to find Orphans (References with no Citation) and 
     * Unmatched (Citations with no Reference).
     * 
     * Then it sends the matched pairs to the backend for Forensic verification.
     */
    static async auditDocument(doc: any, projectId: string): Promise<SimplifiedAuditResult> {
        // 1. Extract Citation Nodes
        const citations = this.extractCitationNodes(doc);

        // 2. Extract Reference List
        const references = this.extractReferences(doc);

        // 3. Match them up
        const matchedPairs = this.matchCitationsToReference(citations, references);

        // 4. Generate local structural flags (Orphans, Unmatched)
        const flags = this.generateStructuralFlags(matchedPairs, references);

        // 5. Send matched pairs to Backend for Forensic Auditing
        const forensicResults = await this.runForensicAudit(matchedPairs, projectId);

        // Merge backend results with local structural flags
        const allFlags = [...flags, ...forensicResults.flags];

        return {
            flags: allFlags,
            verificationResults: forensicResults.verificationResults,
            integrityIndex: this.calculateIntegrity(allFlags)
        };
    }

    private static extractCitationNodes(doc: any) {
        if (!doc) return [];
        const citations: any[] = [];

        // Use ProseMirror's precise node and pos tracker
        if (typeof doc.descendants === 'function') {
            doc.descendants((node: any, pos: number) => {
                // Handle Node Types
                if (node.type.name === "citation") {
                    citations.push({
                        citationId: node.attrs?.citationId,
                        text: node.attrs?.text || "[Citation]",
                        start: pos,
                        end: pos + node.nodeSize
                    });
                }

                // Handle Marks (Legacy or mixed support)
                if (node.marks) {
                    const citationMark = node.marks.find((m: any) => m.type.name === "citation");
                    if (citationMark && node.text) {
                        citations.push({
                            citationId: citationMark.attrs?.citationId,
                            text: node.text,
                            start: pos,
                            end: pos + node.nodeSize
                        });
                    }
                }
            });
        } else if (doc.content) {
            // Fallback for headless JSON audits (e.g. exports) where exact visual indices are not needed
            let currentPos = 1;
            const walk = (node: any) => {
                const startPos = currentPos;
                if (node.type === "citation") {
                    citations.push({
                        citationId: node.attrs?.citationId,
                        text: node.attrs?.text || "[Citation]",
                        start: startPos,
                        end: startPos + 1
                    });
                }
                
                // TipTap uses marks array on text nodes
                if (node.marks && Array.isArray(node.marks)) {
                    const citationMark = node.marks.find((m: any) => m.type === "citation");
                    if (citationMark && node.text) {
                        citations.push({
                            citationId: citationMark.attrs?.citationId,
                            text: node.text,
                            start: startPos,
                            end: startPos + node.text.length
                        });
                    }
                }
                
                // Track position logically
                if (node.text) {
                    currentPos += node.text.length;
                } else if (node.content) {
                    currentPos += 1; // Node start boundary
                    node.content.forEach(walk);
                    currentPos += 1; // Node end boundary
                } else {
                    currentPos += 2; // Empty node boundary
                }
            };
            doc.content.forEach(walk);
        }

        return citations;
    }

    private static extractReferences(doc: any) {
        const references: any[] = [];
        let inRefSection = false;

        if (typeof doc.descendants === 'function') {
            doc.descendants((node: any, pos: number) => {
                if (node.type.name === "heading") {
                    const textContent = node.textContent?.toLowerCase() || "";
                    if (textContent.includes("references") || textContent.includes("works cited") || textContent.includes("bibliography")) {
                        inRefSection = true;
                    } else if (inRefSection) {
                        // Stop if we hit another non-reference heading
                        inRefSection = false;
                    }
                } else if (inRefSection && (node.type.name === "paragraph" || node.type.name === "listItem" || node.type.name === "bibliographyEntry")) {
                    const textContent = node.textContent || "";
                    const text = node.type.name === "bibliographyEntry" ? (node.attrs?.refText || textContent) : textContent;

                    if (text.trim().length > 5) {
                        references.push({
                            id: node.attrs?.citationId || text.substring(0, 20),
                            text: text,
                            start: pos,
                            end: pos + node.nodeSize
                        });
                    }
                }
            });
        } else if (doc.content) {
            let currentPos = 1;
            const walk = (node: any) => {
                const startPos = currentPos;
                const textContent = node.content ? node.content.filter((c: any) => c.text).map((c: any) => c.text).join("") : "";

                if (node.type === "heading") {
                    const text = textContent.toLowerCase();
                    if (text.includes("references") || text.includes("works cited") || text.includes("bibliography")) {
                        inRefSection = true;
                    } else if (inRefSection) {
                        inRefSection = false;
                    }
                } else if (inRefSection && (node.type === "paragraph" || node.type === "listItem" || node.type === "bibliographyEntry")) {
                    const text = node.type === "bibliographyEntry" ? (node.attrs?.refText || textContent) : textContent;
                    if (text.trim().length > 5) {
                        references.push({
                            id: node.attrs?.citationId || text.substring(0, 20),
                            text: text,
                            start: startPos,
                            end: startPos + (node.text ? node.text.length : 1)
                        });
                    }
                }

                // Track position logically
                if (node.text) {
                    currentPos += node.text.length;
                } else if (node.content) {
                    currentPos += 1;
                    node.content.forEach(walk);
                    currentPos += 1;
                } else {
                    currentPos += 2;
                }
            };
            if (doc.content) {
                doc.content.forEach(walk);
            }
        }

        return references;
    }

    private static matchCitationsToReference(citations: any[], references: any[]) {
        // Super simple: we assume citationId matches some identifier in the reference.
        // In a real app, CitationNode stores `citationId` which corresponds to the DB Reference ID.
        return citations.map(cit => {
            // For now, since References are just raw text blocks in Tiptap, 
            // we will need the backend to help us actually parse them, OR 
            // we assume the user inserted them with a 'reference' node.

            // Temporary simple match: does the citation text exist in the reference text?
            const ref = references.find(r => r.text.includes(cit.text.replace(/[()\[\]]/g, '')));

            return {
                inline: cit,
                reference: ref || null
            };
        });
    }

    private static generateStructuralFlags(pairs: any[], references: any[]) {
        const flags: any[] = [];
        const matchedRefIds = new Set(pairs.filter(p => p.reference).map(p => p.reference.id));

        // 1. Unmatched Citations (Citation has no reference in bibliography)
        pairs.filter(p => !p.reference).forEach(p => {
            flags.push({
                type: "STRUCTURAL",
                ruleId: "UNMATCHED_CITATION",
                message: "This citation does not have a corresponding entry in the References section.",
                anchor: { start: p.inline.start, end: p.inline.end, text: p.inline.text }
            });
        });

        // 2. Orphan References (Reference is not cited in text)
        references.filter(r => !matchedRefIds.has(r.id)).forEach(r => {
            flags.push({
                type: "STRUCTURAL",
                ruleId: "ORPHAN_REFERENCE",
                message: "This reference is not cited anywhere in the document.",
                anchor: { start: r.start, end: r.end, text: r.text.substring(0, 50) + "..." }
            });
        });

        return flags;
    }

    private static async runForensicAudit(pairs: any[], projectId: string) {
        // Send to updated backend endpoint that ONLY does Tier 2 Forensic Auditing
        try {
            const { apiClient } = await import("../apiClient");
            // Only send pairs that successfully matched a reference
            const response = await apiClient.post("/api/citations/forensic-audit", {
                pairs: pairs.filter(p => p.reference),
                projectId
            });
            return response;
        } catch (e) {
            console.error(e);
            return { flags: [], verificationResults: [] };
        }
    }

    private static calculateIntegrity(flags: any[]) {
        let score = 100;
        flags.forEach(f => {
            if (f.type === "STRUCTURAL") score -= 5;
            if (f.ruleId?.includes("UNVERIFIED_SOURCE")) score -= 20;
            if (f.ruleId?.includes("UNSUPPORTED")) score -= 15;
            if (f.ruleId?.includes("MISMATCH")) score -= 10;
        });
        return Math.max(0, score);
    }
}
