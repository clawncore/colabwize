// Quick test script to verify citation pattern detection
const testContent = "In one large-scale study, researchers demonstrated that convolutional neural networks could identify malignant with an accuracy exceeding 94%¹.";

console.log("Testing citation detection for:", testContent);

// Test numeric citation patterns
const numericBracketRegex = /\[\s*\d+(?:[\s,\-]+\d+)*\s*\]/g;
const superscriptRegex = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/g;
const authorYearRegex = /\([A-Z][a-zA-Z\s\.\-']+,?\s*\d{4}[a-z]?\)/g;

console.log("Numeric brackets [1]:", testContent.match(numericBracketRegex));
console.log("Superscript numbers:", testContent.match(superscriptRegex));
console.log("Author-year (Smith, 2023):", testContent.match(authorYearRegex));

// Enhanced superscript detection
const enhancedSuperscriptDetection = () => {
  const superscriptMap = {
    '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4,
    '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9
  };

  let foundSuperscripts = [];
  for (let i = 0; i < testContent.length; i++) {
    const char = testContent[i];
    if (superscriptMap[char] !== undefined) {
      foundSuperscripts.push({
        char: char,
        position: i,
        number: superscriptMap[char]
      });
    }
  }

  return foundSuperscripts;
};

console.log("Enhanced superscript detection:", enhancedSuperscriptDetection());

// Test APA violation detection
const detectAPAViolations = (text) => {
  const violations = [];

  // Check for numeric brackets
  const bracketMatches = text.match(numericBracketRegex);
  if (bracketMatches) {
    violations.push({
      type: "NUMERIC_BRACKET",
      message: "APA uses parenthetical citations (Author, Year), not numeric brackets [1]",
      matches: bracketMatches
    });
  }

  // Check for superscript numbers
  const superscriptMatches = enhancedSuperscriptDetection();
  if (superscriptMatches.length > 0) {
    violations.push({
      type: "SUPERSCRIPT_NUMBER",
      message: "APA uses parenthetical citations (Author, Year), not superscript numbers",
      matches: superscriptMatches
    });
  }

  return violations;
};

console.log("APA Violations Detected:", detectAPAViolations(testContent));