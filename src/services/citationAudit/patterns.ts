/* eslint-disable */
export interface ExtractedPattern {
  patternType: string;
  text: string;
  start: number;
  end: number;
}

function isStandaloneUppercaseAbbreviation(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 2 || trimmed.length > 6) return false;
  if (/\s|,|;|\.|\//.test(trimmed)) return false;
  if (/\d/.test(trimmed)) return false;
  return /^[A-Z-]+$/.test(trimmed);
}

export function extractPatterns(
  text: string,
  absolutePos: number,
  mode: string = "default",
): ExtractedPattern[] {
  const matches: ExtractedPattern[] = [];

  // IEEE e.g. [1] or [1-3]
  const ieeeRegex = /\[\d+(?:-\d+)?\]/g;
  let m;
  while ((m = ieeeRegex.exec(text)) !== null) {
    if (m.index === ieeeRegex.lastIndex) ieeeRegex.lastIndex++;
    matches.push({
      patternType: "NUMERIC",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  // APA e.g. (Smith, 2023) or (Smith et al., 2023)
  // Use restrictive negative lookahead/character classes to prevent catastrophic backtracking
  const apaRegex = /\([^()]{2,150}(?:19|20)\d{2}[a-z]?(?:\s*,?\s*[^)]*)?\)/g;
  while ((m = apaRegex.exec(text)) !== null) {
    if (m.index === apaRegex.lastIndex) apaRegex.lastIndex++;
    matches.push({
      patternType: "AUTHOR_YEAR",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  // MLA e.g. (Smith) or (Smith and Doe) or (Smith et al.)
  const mlaRegex = /\([^()]{2,100}(?:et al\.|and\s+[^()]+)?\)/g;
  while ((m = mlaRegex.exec(text)) !== null) {
    if (m.index === mlaRegex.lastIndex) mlaRegex.lastIndex++;
    // Only count if it DOES NOT contain a year (otherwise it's APA/Chicago)
    if (!m[0].match(/\d{4}/)) {
      const inner = m[0].slice(1, -1);
      if (isStandaloneUppercaseAbbreviation(inner)) continue;
      matches.push({
        patternType: "AUTHOR_ONLY",
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
      });
    }
  }

  // Chicago e.g. (Smith 2023) - Note the lack of comma
  const chicagoRegex = /\([^(),]{2,100}\s+(?:19|20)\d{2}[a-z]?\)/g;
  while ((m = chicagoRegex.exec(text)) !== null) {
    if (m.index === chicagoRegex.lastIndex) chicagoRegex.lastIndex++;
    matches.push({
      patternType: "AUTHOR_YEAR_SPACE",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  return matches;
}
