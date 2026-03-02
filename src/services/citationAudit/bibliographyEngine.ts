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
    static async auditDocument(content: JSONContent, projectId: string): Promise<SimplifiedAuditResult> {
        // 1. Extract Citation Nodes
        const citations = this.extractCitationNodes(content);

        // 2. Extract Reference List
        const references = this.extractReferences(content);

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

    private static extractCitationNodes(doc: JSONContent) {
        const citations: any[] = [];
        let offset = 0;

        function walk(node: JSONContent, currentOffset: number) {
            if (node.type === "citation") {
                citations.push({
                    citationId: node.attrs?.citationId,
                    text: node.attrs?.text || "[Citation]",
                    start: currentOffset,
                    end: currentOffset + 1
                });
            } else if (node.marks) {
                const citationMark = node.marks.find(m => m.type === "citation");
                if (citationMark && node.text) {
                    citations.push({
                        citationId: citationMark.attrs?.citationId,
                        text: node.text,
                        start: currentOffset,
                        end: currentOffset + node.text.length
                    });
                }
            }

            if (node.text) {
                offset += node.text.length;
            } else {
                offset += 1; // Open tag
                if (node.content) {
                    node.content.forEach(child => {
                        walk(child, offset);
                    });
                }
                offset += 1; // Close tag
            }
        }

        if (doc.content) {
            doc.content.forEach(child => walk(child, offset));
        }

        return citations;
    }

    private static extractReferences(doc: JSONContent) {
        const references: any[] = [];
        let inRefSection = false;
        let offset = 0;

        function walk(node: JSONContent) {
            if (node.type === "heading" && node.content) {
                const text = node.content.map(c => c.text || "").join("").toLowerCase();
                if (text.includes("references") || text.includes("works cited") || text.includes("bibliography")) {
                    inRefSection = true;
                } else {
                    inRefSection = false;
                }
            } else if (inRefSection && (node.type === "paragraph" || node.type === "listItem")) {
                const text = node.content ? node.content.map(c => c.text || "").join("") : "";
                if (text.trim().length > 10) {
                    references.push({
                        id: text.substring(0, 20), // Hack: we need a real ID system for references if not using backend DB
                        text: text,
                        start: offset,
                        end: offset + text.length
                    });
                }
            }

            if (node.text) offset += node.text.length;
            else {
                offset += 1;
                if (node.content) node.content.forEach(walk);
                offset += 1;
            }
        }

        if (doc.content) {
            doc.content.forEach(walk);
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
            if (f.ruleId?.includes("HALLUCINATION")) score -= 20;
            if (f.ruleId?.includes("UNSUPPORTED")) score -= 15;
            if (f.ruleId?.includes("MISMATCH")) score -= 10;
        });
        return Math.max(0, score);
    }
}
