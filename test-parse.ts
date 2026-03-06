const text = "(Deeks, Lewin, & Havlir, 2013)";
function parseInTextCitation(
    text: string,
): { author: string; year: string } | null {
    const clean = text.trim();

    // Regex to find a 4-digit year near the end of a parenthesized or bracketed string
    // Handles: (Smith, 2023), (Smith 2023), (Smith et al., 2023), [Smith, 2023]
    const match = clean.match(/[([](.*)[,\s]+(\d{4})[a-z]?\s*[)\]]$/);

    if (match) {
        const authorPart = match[1].trim();
        const year = match[2];

        // Extract first logical word of author part (handle "Smith et al" -> "Smith")
        const surname = authorPart.split(/\s+/)[0].replace(/[.,]/g, "").toLowerCase();

        // Basic validation to avoid false positives (e.g. just a date range)
        if (surname.length >= 2 && isNaN(Number(surname))) {
            return { author: surname, year };
        }
    }
    return null;
}
console.log("PARSE:", parseInTextCitation(text));
