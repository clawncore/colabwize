import { extractPatterns } from "./src/services/citationAudit/patterns";

const text = "Since the discovery of HIV in the early 1980s, antiretroviral therapy has transformed the disease from a terminal illness into a manageable chronic condition (Deeks, Lewin, & Havlir, 2013). Integrase strand transfer inhibitors (INSTIs) represent a key class of antiretrovirals that target the HIV integrase enzyme, preventing viral DNA from integrating into the host genome (Finn et al., 2016). Dolutegravir, a second-generation INSTI, was approved by the U.S. Food and Drug Administration in 2013 and has rapidly become a first-line treatment option due to its efficacy and tolerability (Walmsley et al., 2013).";

const matches = extractPatterns(text, 0, "structural");
console.log("MATCHES:", JSON.stringify(matches, null, 2));

const apaRegex = /\([^()]{2,150}(?:19|20)\d{2}[a-z]?(?:\s*,?\s*[^)]*)?\)/g;
console.log("Regex standard match test:");
let m;
while ((m = apaRegex.exec(text)) !== null) {
    console.log("Raw match:", m[0]);
}
