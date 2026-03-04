export interface ExtractedPattern {
  patternType: string;
  text: string;
  start: number;
  end: number;
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

  // Handle et al patterns if required by existing audits
  const etAlPeriodRegex = /\([^()]{2,150}et al\.,\s*(?:19|20)\d{2}[a-z]?(?:\s*,?\s*[^)]*)?\)/g;
  while ((m = etAlPeriodRegex.exec(text)) !== null) {
    if (m.index === etAlPeriodRegex.lastIndex) etAlPeriodRegex.lastIndex++;
    matches.push({
      patternType: "et_al_with_period",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  const etAlNoPeriodRegex = /\([^()]{2,150}et al\s*(?:19|20)\d{2}[a-z]?(?:\s*,?\s*[^)]*)?\)/g;
  while ((m = etAlNoPeriodRegex.exec(text)) !== null) {
    if (m.index === etAlNoPeriodRegex.lastIndex) etAlNoPeriodRegex.lastIndex++;
    matches.push({
      patternType: "et_al_no_period",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    });
  }

  return matches;
}
