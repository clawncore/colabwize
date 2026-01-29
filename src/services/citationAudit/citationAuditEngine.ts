import {
    EditorContent,
    CitationStyle,
    ExtractedPattern,
    AuditRequest,
    DocumentSection,
    ReferenceListExtraction,
    SectionType
} from "./types";
import { extractPatterns } from "./patterns";
import { apiClient } from "../apiClient";
import { DocumentExtractor } from "../../utils/documentExtractor";

import { CitationAuditStateMachine, CitationAuditResult } from "./CitationAuditStateMachine";

/**
 * Main Entry Point for Citation Audit
 * STRICT CLIENT ROLE: Walker, Extractor, Sensor.
 */
export async function runCitationAudit(
    content: EditorContent,
    citationStyle: string
): Promise<CitationAuditResult> {

    console.log("🚀 Starting Enhanced Citation Audit with State Machine");
    console.log("📡 CALLING BACKEND API FOR CITATION MATCHING & VERIFICATION");

    try {
        // Extract document data for backend
        const extracted = decomposeAndExtract(content);

        const auditRequest: AuditRequest = {
            declaredStyle: citationStyle as CitationStyle,
            documentMeta: {
                language: "en",
                editor: "tiptap"
            },
            sections: extracted.sections,
            patterns: extracted.patterns,
            referenceList: extracted.referenceList
        };

        console.log("📤 Sending to backend:", {
            style: auditRequest.declaredStyle,
            patterns: auditRequest.patterns?.length || 0,
            references: auditRequest.referenceList?.entries.length || 0
        });

        // Call backend API
        const response = await apiClient.post("/api/citations/audit", auditRequest);

        console.log("📥 Backend response received:");
        console.log("   - Flags:", response.flags.length);
        console.log("   - Verification Results:", response.verificationResults?.length || 0);

        // Convert verification results into flags for editor highlighting
        // SMART LOGIC: Only flag VER errors if citation passed style check (no STY flag)
        const allFlags = [...response.flags];

        if (response.verificationResults) {
            // Build set of citation positions that already have STY violations
            const styViolationPositions = new Set<string>();
            response.flags.forEach(flag => {
                if (flag.anchor && flag.type !== "VERIFICATION") {
                    // Create position key for this citation
                    const posKey = `${flag.anchor.start}-${flag.anchor.end}`;
                    styViolationPositions.add(posKey);
                }
            });

            console.log(`   🎯 ${styViolationPositions.size} citations already have STY violations - skipping VER flags for these`);

            let verFlagsAdded = 0;
            response.verificationResults.forEach(result => {
                const posKey = `${result.inlineLocation.start}-${result.inlineLocation.end}`;

                // Only create VER flag if:
                // 1. Citation has NO style violation (no STY flag) AND
                // 2. Verification failed
                const hasStyleViolation = styViolationPositions.has(posKey);
                const verificationFailed = result.status === "VERIFICATION_FAILED" || result.status === "UNMATCHED_REFERENCE";

                if (!hasStyleViolation && verificationFailed) {
                    allFlags.push({
                        type: "VERIFICATION",
                        ruleId: `VER.${result.status}`,
                        message: result.message,
                        anchor: {
                            start: result.inlineLocation.start,
                            end: result.inlineLocation.end,
                            text: result.inlineLocation.text
                        }
                    });
                    verFlagsAdded++;
                }
            });

            console.log(`   📝 Added ${verFlagsAdded} VER flags to editor (filtered from ${response.verificationResults.length} total verification results)`);
        }

        // Create processing stats
        const processingStats = {
            totalChunks: 1,
            totalCharacters: JSON.stringify(content).length,
            citationsFound: auditRequest.patterns?.length || 0,
            flagsDetected: allFlags.length  // Include verification flags in count
        };

        console.log("✅ Backend audit completed successfully");
        console.log("📊 Processing Results:", processingStats);

        // If we have flags, the audit found issues
        if (allFlags.length > 0) {
            console.log(`🚩 ${allFlags.length} total violations detected (style + verification):`);
            allFlags.forEach((flag, index) => {
                console.log(`   ${index + 1}. ${flag.ruleId}: ${flag.message}`);
                if (flag.anchor) {
                    console.log(`      Location: ${flag.anchor.start}-${flag.anchor.end}`);
                    console.log(`      Text: "${flag.anchor.text}"`);
                }
            });
        } else {
            console.log("✅ No citation style violations found");
        }

        // Return successful result with state machine (using merged flags)
        return CitationAuditStateMachine.handleSuccessfulScan(
            allFlags,
            processingStats,
            response.verificationResults,  // Pass through for sidebar display
            response.integrityIndex // Pass through CII
        );

    } catch (error: any) {
        console.error("❌ Enhanced citation audit failed:", error);

        // Handle structured backend errors
        const backendCode = error.response?.data?.code;
        const msg = error.response?.data?.error || error.message;

        if (backendCode === "PLAN_LIMIT_REACHED" || backendCode === "INSUFFICIENT_CREDITS") {
            // Map both to QUOTA_EXCEEDED but we can distinguish in UI via errorMessage or a new field
            return {
                state: "FAILED_QUOTA_EXCEEDED",
                violations: [],
                errorMessage: msg,
                quotaInfo: {
                    ...error.response?.data?.data,
                    code: backendCode // Pass code through for UI styling
                }
            };
        } else if (backendCode === "FEATURE_NOT_ALLOWED") {
            return {
                state: "FAILED_SUBSCRIPTION_ERROR",
                violations: [],
                errorMessage: msg,
                quotaInfo: {
                    ...error.response?.data?.data,
                    code: backendCode
                }
            };
        }

        // Handle specific error types with state machine (Legacy wrapper)
        if ((error as any).type === "quota_exceeded") {
            return CitationAuditStateMachine.handleQuotaExceeded(error);
        } else if ((error as any).type === "subscription_error") {
            return CitationAuditStateMachine.handleSubscriptionError(error);
        } else if ((error as any).type === "network_error") {
            // Fallback: Simulate basic audit when backend is offline
            console.log("🔧 Backend offline - running simulated citation audit");
            return await runSimulatedAudit(content, citationStyle);
        }

        // Fallback for unknown errors
        return {
            state: "FAILED_SCAN_ABORTED",
            violations: [],
            errorMessage: `Audit processing failed: ${error.message}`
        };
    }
}

// Fallback audit when backend services are unavailable
async function runSimulatedAudit(
    content: EditorContent,
    citationStyle: string
): Promise<CitationAuditResult> {
    console.log("🧪 Running simulated citation audit");

    try {
        // Extract text content for basic analysis
        const fullText = JSON.stringify(content);

        // Simulate finding some basic citation issues
        const violations: any[] = [];

        // Check for superscript numbers (APA violations)
        const superscriptMatches = fullText.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g);
        if (superscriptMatches && superscriptMatches.length > 0) {
            violations.push({
                type: "FORMAT_VIOLATION",
                ruleId: "SUPERSCRIPT_NUMBER",
                message: `Found ${superscriptMatches.length} superscript numbers. APA style requires parenthetical citations (Author, Year).`,
                anchor: { start: 0, end: 50, text: fullText.substring(0, 50) }
            });
        }

        // Check for numeric brackets
        const bracketMatches = fullText.match(/\[\s*\d+(?:[\s,-]+\d+)*\s*]/g);
        if (bracketMatches && bracketMatches.length > 0) {
            violations.push({
                type: "FORMAT_VIOLATION",
                ruleId: "NUMERIC_BRACKET",
                message: `Found ${bracketMatches.length} numeric brackets. APA style requires parenthetical citations (Author, Year).`,
                anchor: { start: 0, end: 50, text: fullText.substring(0, 50) }
            });
        }

        // Simulate processing stats
        const processingStats = {
            totalChunks: Math.ceil(fullText.length / 500),
            totalCharacters: fullText.length,
            citationsFound: (superscriptMatches?.length || 0) + (bracketMatches?.length || 0),
            flagsDetected: violations.length
        };

        console.log(`🧪 Simulated audit found ${violations.length} issues`);

        return CitationAuditStateMachine.handleSuccessfulScan(violations, processingStats);

    } catch (error: any) {
        console.error("❌ Simulated audit failed:", error);
        return {
            state: "FAILED_SCAN_ABORTED",
            violations: [],
            errorMessage: `Simulated audit failed: ${error.message}`
        };
    }
}

/**
 * STRICT DECOMPOSITION
 * Walks the doc to identify Sections and Patterns.
 */
function decomposeAndExtract(
    doc: EditorContent,
    extractedContent?: ReturnType<typeof DocumentExtractor.extractTextWithPositions>
): {
    sections: DocumentSection[],
    patterns: ExtractedPattern[],
    referenceList: ReferenceListExtraction | null
} {
    const sections: DocumentSection[] = [];
    const patterns: ExtractedPattern[] = [];
    let referenceList: ReferenceListExtraction | null = null;

    let currentOffset = 0;

    // Tracking current section state
    let currentSectionType: SectionType = "BODY";
    let currentSectionTitle: string = "Introduction"; // Default implicit start

    // Check if doc has content
    if (!doc.content) return { sections, patterns, referenceList };

    // Linear walk relative to top-level blocks for simpler section tracking
    doc.content.forEach((block) => {
        // 1. Check for Section Heading
        if (block.type === "heading" && block.content) {
            const titleText = block.content.map(c => c.text).join("");

            // Classify Section
            if (isReferenceHeader(titleText)) {
                currentSectionType = "REFERENCE_SECTION";
                currentSectionTitle = titleText;
                // Initialize reference list container if strictly this is the start
                if (!referenceList) {
                    referenceList = { sectionTitle: titleText, entries: [] };
                } else {
                    // Update title if we found the actual header
                    referenceList.sectionTitle = titleText;
                }
            } else {
                currentSectionType = "BODY";
                currentSectionTitle = titleText;
            }

            sections.push({
                title: currentSectionTitle,
                type: currentSectionType,
                range: { start: currentOffset, end: currentOffset + calculateNodeSize(block) }
            });
        }
        // 2. Extract Reference Entries - Support BOTH lists AND paragraphs
        else if (currentSectionType === "REFERENCE_SECTION") {
            if (referenceList) {
                // Case A: List-based references (ordered or bullet lists)
                if (block.type === "orderedList" || block.type === "bulletList") {
                    if (block.content) {
                        block.content.forEach((listItem, idx) => {
                            const itemText = extractTextFromNode(listItem);
                            if (itemText.trim()) {  // Only add non-empty entries
                                const itemStart = currentOffset + 1;
                                referenceList!.entries.push({
                                    index: referenceList!.entries.length,
                                    rawText: itemText,
                                    start: itemStart,
                                    end: itemStart + itemText.length
                                });
                            }
                        });
                    }
                }
                // Case B: Paragraph-based references (common in APA/MLA)
                else if (block.type === "paragraph") {
                    const paraText = extractTextFromNode(block);
                    // Only add if it looks like a reference (has author/year pattern or is substantial)
                    if (paraText.trim() && paraText.length > 20) {
                        referenceList!.entries.push({
                            index: referenceList!.entries.length,
                            rawText: paraText,
                            start: currentOffset,
                            end: currentOffset + paraText.length
                        });
                    }
                }
            }
        }

        // 3. Extract Patterns (Always run regex sensing)
        const blockText = extractTextFromNode(block);
        if (blockText) {
            const extracted = extractPatterns(
                blockText,
                currentOffset,
                // Context for extraction helper (deprecated by explicit section tracking, but used for range)
            );

            // Map to ExtractedPattern with Section info
            extracted.forEach(p => {
                patterns.push({
                    patternType: p.patternType,
                    text: p.text,
                    start: p.start,
                    end: p.end,
                    section: currentSectionType
                });
            });
        }

        // Advance offset
        currentOffset += calculateNodeSize(block);
    });

    return { sections, patterns, referenceList };
}

// Helpers

function isReferenceHeader(text: string): boolean {
    const t = text.toLowerCase().trim();
    return t === "references" || t === "works cited" || t === "bibliography";
}

function calculateNodeSize(node: EditorContent): number {
    if (node.text) return node.text.length;
    let size = 2; // Tag overhead
    if (node.content) {
        node.content.forEach(c => size += calculateNodeSize(c));
    }
    return size;
}

function extractTextFromNode(node: EditorContent): string {
    if (node.text) return node.text;
    if (node.content) return node.content.map(c => extractTextFromNode(c)).join("");
    return "";
}


