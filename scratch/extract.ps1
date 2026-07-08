Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "E:\allproject\panjerIT-backend\backend-panzer\backend-panzer-two.zip"
$extractPath = "E:\allproject\panjerIT-backend\backend-panzer\src\app\(frontend)"

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

foreach ($entry in $zip.Entries) {
    if ($entry.FullName -match "src/app/\(frontend\)/(blog-details|brand-detail|solution-details)/\[slug\]") {
        
        $destPath = $entry.FullName
        $destPath = $destPath -replace "src/app/\(frontend\)/solution-details/\[slug\]", "solution\[slug]"
        $destPath = $destPath -replace "src/app/\(frontend\)/brand-detail/\[slug\]", "brand\[slug]"
        $destPath = $destPath -replace "src/app/\(frontend\)/blog-details/\[slug\]", "blog\[slug]"
        
        # Replace forward slashes with backslashes for Windows path joining
        $destPath = $destPath.Replace("/", "\")
        
        $fullDestPath = Join-Path $extractPath $destPath
        
        $destDir = Split-Path $fullDestPath -Parent
        if (-not (Test-Path -LiteralPath $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        
        if (-not $entry.FullName.EndsWith("/")) {
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $fullDestPath, $true)
            Write-Host "Extracted $fullDestPath"
        }
    }
}
$zip.Dispose()
Write-Host "Extraction complete!"
