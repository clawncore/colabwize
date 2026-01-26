import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { DocumentExtractor } from "../../utils/documentExtractor";
import { EnhancedCitationProcessor } from "../../services/citationAudit/EnhancedCitationProcessor";

interface CitationAuditDemoProps {
  editor: Editor | null;
  projectId: string;
}

export const CitationAuditDemo: React.FC<CitationAuditDemoProps> = ({
  editor,
  projectId
}) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [demoContent, setDemoContent] = useState({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Sample Research Paper" }]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "According to recent studies (Smith, 2023), artificial intelligence is transforming various industries. The research indicates significant improvements in efficiency and accuracy [1]."
          }
        ]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Literature Review" }]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Previous work has established foundational theories (Johnson & Brown, 2022). However, there are limitations in current approaches that need addressing [2]."
          }
        ]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "References" }]
      },
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Smith, J. (2023). AI Transformations. Journal of Technology, 15(2), 45-67."
                  }
                ]
              }
            ]
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Johnson, A., & Brown, K. (2022). Foundational Approaches. Academic Review, 8(4), 123-145."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  const handleLoadDemo = () => {
    if (editor) {
      editor.commands.setContent(demoContent);
    }
  };

  const handleTestExtraction = () => {
    if (editor) {
      const content = editor.getJSON();
      const extracted = DocumentExtractor.extractTextWithPositions(content);

      console.log("=== EXTRACTION RESULTS ===");
      console.log("Full Text:", extracted.fullText);
      console.log("Word Count:", extracted.fullText.split(/\s+/).filter(w => w.length > 0).length);
      console.log("Character Count:", extracted.fullText.length);
      console.log("Citations Found:", extracted.citations);
      console.log("Sections Identified:", extracted.sections);

      alert(`Extraction Complete!

Words: ${extracted.fullText.split(/\s+/).filter(w => w.length > 0).length}
Characters: ${extracted.fullText.length}
Citations: ${extracted.citations.length}
Sections: ${extracted.sections.length}`);
    }
  };

  const handleTestChunkedProcessing = async () => {
    if (editor) {
      try {
        const content = editor.getJSON();

        console.log("🧪 Testing Enhanced Chunked Processing...");

        const { auditReport, processingStats } = await EnhancedCitationProcessor.processDocumentInChunks(
          content,
          "APA"
        );

        setTestResults({
          auditReport,
          processingStats
        });

        console.log("✅ Chunked Processing Results:", processingStats);
        console.log("🚩 Audit Flags Found:", auditReport.flags.length);

        alert(`Enhanced Audit Complete!

Chunks Processed: ${processingStats.totalChunks}
Total Characters: ${processingStats.totalCharacters}
Citations Found: ${processingStats.citationsFound}
Violations Detected: ${processingStats.flagsDetected}

Check console for detailed results.`);

      } catch (error) {
        console.error("❌ Chunked processing test failed:", error);
        alert(`Processing failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Citation Audit Demo</h3>

      <div className="space-y-3">
        <button
          onClick={handleLoadDemo}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Load Sample Document
        </button>

        <button
          onClick={handleTestExtraction}
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Test Content Extraction
        </button>

        <button
          onClick={handleTestChunkedProcessing}
          className="w-full py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Test Chunked Audit Processing
        </button>

        <div className="text-sm text-gray-600">
          <p className="mb-2"><strong>Demo Features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Visual scanning animation during audit</li>
            <li>Enhanced text extraction with metadata</li>
            <li>Real-time document statistics</li>
            <li>Chunked processing (500 chars per chunk)</li>
            <li>Improved citation pattern detection</li>
            <li>Active violation flagging</li>
            <li>Better error handling and validation</li>
          </ul>
        </div>

        {/* Test Results Display */}
        {testResults && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-bold mb-2">Latest Test Results:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Chunks: <span className="font-mono">{testResults.processingStats.totalChunks}</span></div>
              <div>Characters: <span className="font-mono">{testResults.processingStats.totalCharacters}</span></div>
              <div>Citations: <span className="font-mono">{testResults.processingStats.citationsFound}</span></div>
              <div>Flags: <span className="font-mono text-red-600">{testResults.processingStats.flagsDetected}</span></div>
            </div>
            {testResults.auditReport.flags.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="font-bold text-red-600">Violations Detected:</p>
                {testResults.auditReport.flags.slice(0, 3).map((flag: any, idx: number) => (
                  <div key={idx} className="text-red-500 truncate">
                    • {flag.ruleId}: {flag.message.substring(0, 50)}...
                  </div>
                ))}
                {testResults.auditReport.flags.length > 3 && (
                  <div className="text-gray-500 text-xs">
                    ... and {testResults.auditReport.flags.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};