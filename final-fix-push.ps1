Write-Host "Applying final fixes patch..." -ForegroundColor Green
git apply fix-images-and-urls.patch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply patch" -ForegroundColor Red
    exit 1
}

Write-Host "Committing changes..." -ForegroundColor Green
git add -A
git commit -m "Fix: Apply final event fixes with real images and URLs"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin main -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushed successfully! Reseeding database..." -ForegroundColor Green
    Start-Sleep -Seconds 5
    curl "https://web-production-8e062.up.railway.app/api/seed?key=dev-secret-key"
    Write-Host "DONE! All fixes deployed with real images and ticket URLs" -ForegroundColor Green
}
