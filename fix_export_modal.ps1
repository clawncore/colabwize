$file = 'c:\Users\maroe\Documents\Projects\WebSites\collaboratewise\src\components\export\ExportWorkflowModal.tsx'
$content = [System.IO.File]::ReadAllText($file)

# 1. Update Step type and add ExportDestination
$content = $content.Replace(
    'type Step = "details" | "format" | "mode" | "review";',
    'type Step = "details" | "format" | "destination" | "review";'
)

# 2. Add ExportDestination type after ExportFormat
$content = $content.Replace(
    "type ExportFormat = `"docx`" | `"pdf`" | `"latex`" | `"rtf`" | `"txt`";`r`ntype ExportMode = `"standard`" | `"journal`";",
    "type ExportFormat = `"docx`" | `"pdf`" | `"latex`" | `"rtf`" | `"txt`";`r`ntype ExportDestination = `"local`" | `"google-drive`" | `"zotero`" | `"mendeley`";`r`ntype ExportMode = `"standard`" | `"journal`";"
)

# 3. Add exportDestination state after downloading state
$content = $content.Replace(
    '  const [downloading, setDownloading] = useState(false);',
    "  const [downloading, setDownloading] = useState(false);`r`n  const [exportDestination, setExportDestination] = useState<ExportDestination>(`"local`");"
)

# 4. Update navigation to include destination step
$old = @"
  const goToNextStep = () => {
    if (currentStep === "details") setCurrentStep("format");
    else if (currentStep === "format" && selectedFormat)
      setCurrentStep("review");
    // else if (currentStep === "mode") setCurrentStep("review");
  };
"@
$new = @"
  const goToNextStep = () => {
    if (currentStep === "details") setCurrentStep("format");
    else if (currentStep === "format" && selectedFormat)
      setCurrentStep("destination");
    else if (currentStep === "destination") setCurrentStep("review");
  };
"@
$content = $content.Replace($old, $new)

# 5. Update step header array to include destination
$content = $content.Replace(
    '{["details", "format", "review"].map((step, idx) => {',
    '{["details", "format", "destination", "review"].map((step, idx) => {'
)
$content = $content.Replace(
    'const stepNames = ["Details", "Format", "Review"];',
    'const stepNames = ["Details", "Format", "Destination", "Review"];'
)
$content = $content.Replace(
    '["details", "format", "review"].indexOf(currentStep) > idx;',
    '["details", "format", "destination", "review"].indexOf(currentStep) > idx;'
)

# 6. Update connector line count (was idx < 2, now idx < 3)
$content = $content.Replace(
    '{idx < 2 && (',
    '{idx < 3 && ('
)

# 7. Add destination step rendering in the main content area
$content = $content.Replace(
    '{/* {currentStep === "mode" && renderModeContent()} */}',
    '{currentStep === "destination" && renderDestinationContent()}'
)

# 8. Add import for ExportService and Cloud icon
$content = $content.Replace(
    "  Pencil,`r`n} from `"lucide-react`";",
    "  Pencil,`r`n  Cloud,`r`n  Download,`r`n} from `"lucide-react`";`r`nimport ExportService from `"../../services/exportService`";"
)

# 9. Add renderDestinationContent function before the return statement
$destinationContent = @"

  // Step 3: Destination Content
  const renderDestinationContent = () => {
    const destinations = [
      { id: "local" as ExportDestination, label: "Local Download", desc: "Download file to your device", icon: "💾", color: "bg-gray-600" },
      { id: "google-drive" as ExportDestination, label: "Google Drive", desc: "Export directly to Google Drive", icon: "📁", color: "bg-blue-500" },
      { id: "zotero" as ExportDestination, label: "Zotero", desc: "Export metadata to Zotero library", icon: "📚", color: "bg-red-500" },
      { id: "mendeley" as ExportDestination, label: "Mendeley", desc: "Export metadata to Mendeley library", icon: "🔬", color: "bg-green-600" },
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
              className={`relative p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${"$"}{
                exportDestination === dest.id
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${"$"}{dest.color} flex items-center justify-center text-xl`}>
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

"@

$content = $content.Replace(
    '  return (',
    "$destinationContent  return ("
)

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ExportWorkflowModal.tsx updated successfully!"
