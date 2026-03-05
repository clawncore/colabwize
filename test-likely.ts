function isLikelyCitation(text: string): boolean {
    const cleanText = text.trim();
    // Bibliography entries are generally dense and long.
    // Minimum 40 characters ensures we don't accidentally match tiny in-text pills or short sentences.
    if (cleanText.length < 40) return false;

    // FAST BAILOUT: If it doesn't contain a citation year pattern or typical citation characters, skip it
    if (!cleanText.includes("(") && !cleanText.includes("[") && !cleanText.match(/\d{4}/)) {
        return false;
    }

    // Explicitly reject single sentences that just happen to contain an in-text citation at the end.
    // e.g., "This is a test sentence (Smith, 2021)."
    if (cleanText.split(".").length <= 2 && cleanText.endsWith(".")) {
        // Look for typical sentence starts. Bibliography chunks don't look like generic sentences.
        if (
            cleanText.includes("This") ||
            cleanText.includes("The") ||
            cleanText.includes("In ")
        ) {
            return false; // Heuristic bailout
        }
    }

    // IEEE style check: starts with [1]
    if (/^\[\d+\]\s/.test(cleanText)) return true;

    // APA/Harvard style check:
    // Must be Author Name, Initials. (Year).
    // e.g. Smith, J. (2020)
    if (
        /^[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+(?:(?:&|and)\s*[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+)*\(\d{4}[a-z]?\)/.test(
            cleanText.substring(0, 100),
        )
    )
        return true;

    // Looser APA fallback: Author Last Name (Year) IF there are multiple bibliographic indicators
    // but avoid matching normal English sentences like "Since the discovery (2010)"
    if (/^[A-Z][a-zÀ-ÿ-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100))) {
        // If it starts with a common English word, it's a sentence, not an author name.
        const firstWord = cleanText.split(" ")[0].toLowerCase();
        const commonWords = [
            "the",
            "this",
            "in",
            "a",
            "an",
            "to",
            "for",
            "it",
            "since",
            "as",
            "when",
        ];
        if (
            (!commonWords.includes(firstWord) && cleanText.includes("vol")) ||
            cleanText.includes("journal") ||
            cleanText.includes("doi")
        ) {
            return true;
        }
    }

    // Fallback keyword clustering check (dense academic identifiers)
    const keywords = [
        "doi.org",
        "et al.",
        "vol.",
        "journal",
        "http",
        "pp.",
        "press",
        "pmid",
    ];
    let matches = 0;
    for (const kw of keywords) {
        if (cleanText.toLowerCase().includes(kw)) matches++;
    }

    // If it has at least 2 strong academic keywords, it's very likely a reference
    return matches >= 2;
}

const text = "Since the discovery of HIV in the early 1980s, antiretroviral therapy has transformed the disease from a terminal illness into a manageable chronic condition (Deeks, Lewin, & Havlir, 2013). Integrase strand transfer inhibitors (INSTIs) represent a key class of antiretrovirals that target the HIV integrase enzyme, preventing viral DNA from integrating into the host genome (Finn et al., 2016). Dolutegravir, a second-generation INSTI, was approved by the U.S. Food and Drug Administration in 2013 and has rapidly become a first-line treatment option due to its efficacy and tolerability (Walmsley et al., 2013).";

const text2 = "Deeks, S. G., Lewin, S. R., & Havlir, D. V. (2013). The end of AIDS: HIV infection as a chronic disease. Lancet, 382(9903), 1525–1533. https://doi.org/10.1016/S0140-6736(13)61809-7";

console.log("Likely citation 1 (body parag)?", isLikelyCitation(text));
console.log("Likely citation 2 (biblography parag)?", isLikelyCitation(text2));
