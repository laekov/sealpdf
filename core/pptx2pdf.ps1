$null = [Reflection.Assembly]::LoadWithPartialName("Microsoft.Office.Interop.PowerPoint")
$null = [Reflection.Assembly]::LoadWithPartialName("Microsoft.Office.Core.MsoTriState")

$pptApp = New-Object Microsoft.Office.Interop.PowerPoint.ApplicationClass

$slides= $pptApp.Presentations.Open($args[0])

$pdfPath = $args[1]
# $slides.ExportAsFixedFormat($pdfPath, [Microsoft.Office.Interop.PowerPoint.PpFixedFormatType]::ppFixedFormatTypePDF)
$slides.SaveAs($pdfPath, [Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType]::ppSaveAsPDF)

$slides.Close()
$pptApp.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($slides) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null

# Remove PowerShell reference to PowerPoint
Remove-Variable pptApp
