$file = 'c:\Users\maroe\Documents\Projects\WebSites\collaboratewise\src\components\export\ExportWorkflowModal.tsx'
$lines = [System.IO.File]::ReadAllLines($file)

for ($i = 0; $i -lt $lines.Length; $i++) {
    # Fix navigation: change "review" to "destination" after format step
    if ($lines[$i] -match 'setCurrentStep\("review"\);' -and $i -gt 0 -and $lines[$i-1] -match 'currentStep === "format"') {
        $lines[$i] = $lines[$i].Replace('setCurrentStep("review")', 'setCurrentStep("destination")')
        Write-Host "Fixed format->destination navigation at line $($i+1)"
    }
    
    # Fix: replace the mode comment with destination step
    if ($lines[$i] -match '// else if \(currentStep === "mode"\)') {
        $lines[$i] = '    else if (currentStep === "destination") setCurrentStep("review");'
        Write-Host "Fixed destination->review navigation at line $($i+1)"
    }
}

[System.IO.File]::WriteAllLines($file, $lines)
Write-Host "Navigation fix applied!"
