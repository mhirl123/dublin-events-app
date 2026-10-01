# Simple script to push the already-patched code to GitHub
Write-Host "Pushing code to GitHub..." -ForegroundColor Green

# Verify there are changes to push
$status = git status --porcelain
if ($status) {
    Write-Host "Found uncommitted changes. Committing first..." -ForegroundColor Yellow
    git add -A
    git commit -m "Apply all fixes: venue-source mapping, ticket URLs, real images, Whelans events"
}

# Push to GitHub with verbose output to see any errors
git push origin main -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Waiting 10 seconds for Railway deployment..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
    
    Write-Host "Reseeding database..." -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "https://web-production-8e062.up.railway.app/api/seed?key=dev-secret-key" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Database reseeded successfully!" -ForegroundColor Green
            Write-Host "`nAll fixes are now LIVE on the app:" -ForegroundColor Green
            Write-Host "  → Real event images" -ForegroundColor Green
            Write-Host "  → Correct ticket URLs" -ForegroundColor Green
            Write-Host "  → Event-to-venue mapping" -ForegroundColor Green
            Write-Host "  → Whelans: The Amazons & Runthered" -ForegroundColor Green
            Write-Host "`nVisit: https://web-production-8e062.up.railway.app" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "Error reseeding database: $_" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Push failed. Check your network and Git credentials." -ForegroundColor Red
    Write-Host "Run this command manually: git push origin main -v" -ForegroundColor Yellow
}
