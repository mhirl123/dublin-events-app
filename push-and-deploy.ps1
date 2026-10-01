Write-Host "Pushing code to GitHub..." -ForegroundColor Green
git push origin main -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Pushed to GitHub" -ForegroundColor Green
    Start-Sleep -Seconds 10
    Write-Host "Reseeding database..." -ForegroundColor Green
    curl "https://web-production-8e062.up.railway.app/api/seed?key=dev-secret-key"
    Write-Host "All fixes deployed!" -ForegroundColor Green
} else {
    Write-Host "Push failed - check credentials" -ForegroundColor Red
}
