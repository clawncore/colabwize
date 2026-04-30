const fs = require('fs');

const path = 'c:/Users/maroe/Documents/Projects/WebSites/collaboratewise/src/components/export/ExportWorkflowModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  /Pencil,\s*\n} from "lucide-react";/,
  'Pencil,\n  Cloud,\n  Download,\n} from "lucide-react";\nimport { ExportService } from "../../services/exportService";'
);

// 2. Types
content = content.replace(
  /type Step = "details" \| "format" \| "mode" \| "review";/,
  'type Step = "details" | "format" | "destination" | "review";\ntype ExportDestination = "local" | "google-drive" | "zotero" | "mendeley";'
);

// 3. State
content = content.replace(
  /const \[downloading, setDownloading\] = useState\(false\);/,
  'const [downloading, setDownloading] = useState(false);\n  const [exportDestination, setExportDestination] = useState<ExportDestination>("local");'
);

// 4. Handle Download
const oldHandleDownload = `        const response = await apiClient.download("/api/files", {
          fileData: {
            id: project.id,
            title: documentTitle,
            content: currentContent,
            htmlContent: preparedHtml,
            // citations: citationsToSend, 
            metadata: {
              author,
              institution: affiliation,
              course,
              instructor,
              runningHead,
              date,
            },
          },
          fileType: \`export-\${selectedFormat}\`,
          userId: userId,
        });

        // apiClient throws on errors, so we can assume response.ok is true here
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Primary document download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = \`\${documentTitle.replace(/[^a-zA-Z0-9-_]/g, "_")}.\${selectedFormat}\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

        toast({
          title: "Download Started",
          description: \`Your \${selectedFormat.toUpperCase()} file is ready.\`,
        });`;

const newHandleDownload = `        const filePayload = {
          fileData: {
            id: project.id,
            title: documentTitle,
            content: currentContent,
            htmlContent: preparedHtml,
            metadata: {
              author,
              institution: affiliation,
              course,
              instructor,
              runningHead,
              date,
            },
          },
          fileType: \`export-\${selectedFormat}\`,
          userId: userId,
        };

        if (exportDestination === "local") {
          const response = await apiClient.download("/api/files", filePayload);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = \`\${documentTitle.replace(/[^a-zA-Z0-9-_]/g, "_")}.\${selectedFormat}\`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

          toast({
            title: "Download Started",
            description: \`Your \${selectedFormat?.toUpperCase()} file is ready.\`,
          });
        } else if (exportDestination === "google-drive") {
          await ExportService.exportToGoogleDrive(project.id, {
            ...filePayload.fileData,
            format: selectedFormat
          });
          toast({
            title: "Export Success",
            description: "Successfully exported to Google Drive.",
          });
        } else if (exportDestination === "zotero") {
          await ExportService.exportToZotero(project.id, {
             title: documentTitle,
             metadata: filePayload.fileData.metadata
          });
          toast({
            title: "Export Success",
            description: "Successfully exported metadata to Zotero.",
          });
        } else if (exportDestination === "mendeley") {
          await ExportService.exportToMendeley(project.id, {
             title: documentTitle,
             metadata: filePayload.fileData.metadata
          });
          toast({
            title: "Export Success",
            description: "Successfully exported metadata to Mendeley.",
          });
        }`;

content = content.replace(oldHandleDownload, newHandleDownload);

// 5. Navigation
const oldGoToNext = `  const goToNextStep = () => {
    if (currentStep === "details") setCurrentStep("format");
    else if (currentStep === "format" && selectedFormat)
      setCurrentStep("review");
    // else if (currentStep === "mode") setCurrentStep("review");
  };`;

const newGoToNext = `  const goToNextStep = () => {
    if (currentStep === "details") setCurrentStep("format");
    else if (currentStep === "format" && selectedFormat)
      setCurrentStep("destination");
    else if (currentStep === "destination") setCurrentStep("review");
  };`;
content = content.replace(oldGoToNext, newGoToNext);

// 6. renderDestinationContent
const destinationContentString = `
  const renderDestinationContent = () => {
    const destinations = [
      { id: "local" as ExportDestination, label: "Local Download", desc: "Download file to your device", icon: "\u{1F4BE}", color: "bg-gray-600" },
      { id: "google-drive" as ExportDestination, label: "Google Drive", desc: "Export directly to Google Drive", icon: "\u{1F4C1}", color: "bg-blue-500" },
      { id: "zotero" as ExportDestination, label: "Zotero", desc: "Export metadata to Zotero library", icon: "\u{1F4DA}", color: "bg-red-500" },
      { id: "mendeley" as ExportDestination, label: "Mendeley", desc: "Export metadata to Mendeley library", icon: "\u{1F52C}", color: "bg-green-600" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Destination</h2>
          <p className="text-gray-500">Choose where to send your exported document.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {destinations.map((dest) => (
             <button
              key={dest.id}
              onClick={() => setExportDestination(dest.id)}
              className={\`relative p-5 rounded-xl border-2 text-left transition-all hover:shadow-md \${
                exportDestination === dest.id
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }\`}>
              <div className="flex items-start gap-4">
                <div className={\`w-10 h-10 rounded-lg \${dest.color} flex items-center justify-center text-xl\`}>
                  {dest.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{dest.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{dest.desc}</p>
                  {(dest.id === "zotero" || dest.id === "mendeley") && (
                    <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Metadata only</span>
                  )}
                </div>
              </div>
              {exportDestination === dest.id && (
                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>`;

content = content.replace(/  return \(\n    <Dialog open=\{isOpen\} onOpenChange=\{onClose\}>/, destinationContentString);

// 7. Render it
content = content.replace(
  /\{\/\* \{currentStep === "mode" && renderModeContent\(\)\} \*\/\}/,
  '{currentStep === "destination" && renderDestinationContent()}'
);

// 8. Header map
content = content.replace(
  /\{\["details", "format", "review"\]\.map\(\(step, idx\) => \{/,
  '{["details", "format", "destination", "review"].map((step, idx) => {'
);
content = content.replace(
  /const stepNames = \["Details", "Format", "Review"\];/,
  'const stepNames = ["Details", "Format", "Destination", "Review"];'
);
content = content.replace(
  /\["details", "format", "review"\]\.indexOf\(currentStep\) > idx;/,
  '["details", "format", "destination", "review"].indexOf(currentStep) > idx;'
);
content = content.replace(
  /\{idx < 2 && \(/,
  '{idx < 3 && ('
);

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully patched ExportWorkflowModal.tsx");
