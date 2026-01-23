/**
 * Frontend Template Registry
 * 
 * Central export point for all templates.
 * Provides utility functions to access templates without backend API calls.
 */

import { Template } from "./types";
import { researchPaperTemplate } from "./researchPaper";
import { literatureReviewTemplate } from "./literatureReview";
import { researchProposalTemplate } from "./researchProposal";
import { thesisTemplate } from "./thesis";

// Template registry - all available templates
const templates: Template[] = [
    researchPaperTemplate,
    literatureReviewTemplate,
    researchProposalTemplate,
    thesisTemplate,
];

/**
 * Get a template by its type
 * @param type - The template type identifier
 * @returns The template object or null if not found
 */
export function getTemplateByType(type: string): Template | null {
    return templates.find((t) => t.type === type) || null;
}

/**
 * Get all available templates
 * @returns Array of all templates
 */
export function getAllTemplates(): Template[] {
    return templates;
}

/**
 * Check if a template type exists
 * @param type - The template type to check
 * @returns True if template exists
 */
export function hasTemplate(type: string): boolean {
    return templates.some((t) => t.type === type);
}

// Export individual templates for direct import
export { researchPaperTemplate } from "./researchPaper";
export { literatureReviewTemplate } from "./literatureReview";
export { researchProposalTemplate } from "./researchProposal";
export { thesisTemplate } from "./thesis";

// Export types
export type { Template, TemplateType, TemplateContent } from "./types";
