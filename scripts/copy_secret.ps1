# Script to prepare the Google Cloud Key for GitHub Secrets
# This converts the file to a single-line Base64 string to avoid formatting errors.

$KeyFile = ".\gcp-key.json"

if (-not (Test-Path $KeyFile)) {
    Write-Error "File $KeyFile not found!"
    exit 1
}

# Read bytes and convert to Base64
$Bytes = [System.IO.File]::ReadAllBytes($KeyFile)
$Base64 = [System.Convert]::ToBase64String($Bytes)

# Copy to clipboard
Set-Clipboard -Value $Base64

Write-Host "✅ Success!" -ForegroundColor Green
Write-Host "The Base64 key has been copied to your clipboard."
Write-Host " "
Write-Host "Next Step:"
Write-Host "1. Go to GitHub -> Settings -> Secrets."
Write-Host "2. Create a NEW secret named: GCP_SA_KEY_B64"
Write-Host "3. Paste the content from your clipboard."
