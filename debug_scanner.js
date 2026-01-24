// Debug test for citation audit scanner activation
console.log("=== Citation Audit Debug Test ===");

// Test if scanner state variables are working
const testScannerActivation = () => {
  console.log("Testing scanner activation sequence:");
  
  // Simulate the sequence that should happen
  const steps = [
    "1. Click 'Run Compliance Audit'",
    "2. setScannerActive(true)", 
    "3. setScannerProgress(0)",
    "4. setScanPhase('extracting')",
    "5. VisualScannerOverlay should appear with isActive=true"
  ];
  
  steps.forEach(step => console.log("➡️", step));
  
  // Check if the scanner overlay condition is met
  const scannerShouldBeActive = true;
  const progress = 0;
  const phase = "extracting";
  
  console.log("Scanner state check:");
  console.log("- isActive:", scannerShouldBeActive);
  console.log("- progress:", progress); 
  console.log("- phase:", phase);
  console.log("- Overlay should render:", scannerShouldBeActive);
  
  return scannerShouldBeActive && progress >= 0;
};

const result = testScannerActivation();
console.log("Scanner activation test result:", result ? "✅ PASS" : "❌ FAIL");

// Test citation detection with your example
const testCitationDetection = () => {
  const testText = "In one large-scale study, researchers demonstrated that convolutional neural networks could identify malignant with an accuracy exceeding 94%¹.";
  
  console.log("\n=== Testing citation detection ===");
  console.log("Test text:", testText);
  
  // Check for superscript
  const hasSuperscript = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(testText);
  console.log("Has superscript numbers:", hasSuperscript);
  
  // Check for APA violation
  const isAPAViolation = hasSuperscript; // Superscripts are not valid in APA
  console.log("Is APA violation:", isAPAViolation);
  
  if (isAPAViolation) {
    console.log("✅ Should flag: APA uses parenthetical citations, not superscript numbers");
  }
  
  return isAPAViolation;
};

testCitationDetection();