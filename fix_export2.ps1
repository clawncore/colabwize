$file = 'c:\Users\maroe\Documents\Projects\WebSites\collaboratewise\src\components\export\ExportWorkflowModal.tsx'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Find and remove the misplaced renderDestinationContent block (lines 945-992)
# It was injected between the step header variables and the return statement
$startRemove = -1
$endRemove = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Trim() -eq '// Step 3: Destination Content') {
        $startRemove = $i
    }
    if ($startRemove -ge 0 -and $lines[$i].Trim() -eq '};' -and $i -gt $startRemove + 5) {
        $endRemove = $i
        break
    }
}

Write-Host "Removing misplaced block from line $($startRemove+1) to $($endRemove+1)"

# Also remove the blank line before it (line 945)
if ($startRemove -gt 0 -and $lines[$startRemove - 1].Trim() -eq '') {
    $startRemove = $startRemove - 1
}

$newLines = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -ge $startRemove -and $i -le $endRemove) {
        continue  # Skip the misplaced block
    }
    [void]$newLines.Add($lines[$i])
}

# Now find the correct place to insert renderDestinationContent - before "return ("
$insertIdx = -1
for ($i = 0; $i -lt $newLines.Count; $i++) {
    if ($newLines[$i].Trim() -eq 'return (' -and $i -gt 700) {
        $insertIdx = $i
        break
    }
}

Write-Host "Inserting renderDestinationContent before line $($insertIdx+1)"

$destBlock = @(
    ''
    '  // Step 3: Destination Content'
    '  const renderDestinationContent = () => {'
    '    const destinations = ['
    '      { id: "local" as ExportDestination, label: "Local Download", desc: "Download file to your device", icon: "\u{1F4BE}", color: "bg-gray-600" },'
    '      { id: "google-drive" as ExportDestination, label: "Google Drive", desc: "Export directly to Google Drive", icon: "\u{1F4C1}", color: "bg-blue-500" },'
    '      { id: "zotero" as ExportDestination, label: "Zotero", desc: "Export metadata to Zotero library", icon: "\u{1F4DA}", color: "bg-red-500" },'
    '      { id: "mendeley" as ExportDestination, label: "Mendeley", desc: "Export metadata to Mendeley library", icon: "\u{1F52C}", color: "bg-green-600" },'
    '    ];'
    ''
    '    return ('
    '      <div className="space-y-6">'
    '        <div>'
    '          <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Destination</h2>'
    '          <p className="text-gray-500">Choose where to send your exported document.</p>'
    '        </div>'
    '        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">'
    '          {destinations.map((dest) => ('
    '            <button'
    '              key={dest.id}'
    '              onClick={() => setExportDestination(dest.id)}'
    '              className={`relative p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${' 
    '                exportDestination === dest.id'
    '                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"'
    '                  : "border-gray-200 bg-white hover:border-gray-300"'
    '              }`}>'
    '              <div className="flex items-start gap-4">'
    '                <div className={`w-10 h-10 rounded-lg ${dest.color} flex items-center justify-center text-xl`}>'
    '                  {dest.icon}'
    '                </div>'
    '                <div>'
    '                  <p className="font-semibold text-gray-900">{dest.label}</p>'
    '                  <p className="text-sm text-gray-500 mt-0.5">{dest.desc}</p>'
    '                  {(dest.id === "zotero" || dest.id === "mendeley") && ('
    '                    <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Metadata only</span>'
    '                  )}'
    '                </div>'
    '              </div>'
    '              {exportDestination === dest.id && ('
    '                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-600" />'
    '              )}'
    '            </button>'
    '          ))}'
    '        </div>'
    '      </div>'
    '    );'
    '  };'
    ''
)

$newLines.InsertRange($insertIdx, $destBlock)

# Now find and add the destination step rendering in the main content area
for ($i = 0; $i -lt $newLines.Count; $i++) {
    if ($newLines[$i] -match 'currentStep === "format" && renderFormatContent') {
        # Check next line for the mode comment or destination
        if ($newLines[$i+1] -match 'currentStep === "mode"' -or $newLines[$i+1] -match '{/\*.*mode') {
            $newLines[$i+1] = '              {currentStep === "destination" && renderDestinationContent()}'
            Write-Host "Updated destination rendering at line $($i+2)"
        }
        break
    }
}

[System.IO.File]::WriteAllLines($file, $newLines.ToArray(), [System.Text.Encoding]::UTF8)
Write-Host "File fixed successfully! Total lines: $($newLines.Count)"
