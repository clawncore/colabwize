import { extractPatterns } from "./src/services/citationAudit/patterns";

const text2 = "Deeks, S. G., Lewin, S. R., & Havlir, D. V. (2013). The end of AIDS: HIV infection as a chronic disease.";
console.log("MATCHES2:", extractPatterns(text2, 0, "structural"));
