# Apply all patch files and push to GitHub
Write-Host "Applying patch files..." -ForegroundColor Green

# Apply each patch
git apply "0001-Fix-Map-event-sources-to-correct-venues-venues-and-F.patch"
if ($LASTEXITCODE -ne 0) { Write-Host "Error applying patch 1"; exit 1 }

git apply "0002-Fix-Update-ticket-URLs-to-link-to-venue-specific-eve.patch"
if ($LASTEXITCODE -ne 0) { Write-Host "Error applying patch 2"; exit 1 }

git apply "0003-Fix-Replace-placeholder-image-URLs-with-real-Unsplas.patch"
if ($LASTEXITCODE -ne 0) { Write-Host "Error applying patch 3"; exit 1 }

git apply "0004-Fix-Update-Whelans-events-to-match-real-venues-with-.patch"
if ($LASTEXITCODE -ne 0) { Write-Host "Error applying patch 4"; exit 1 }

Write-Host "All patches applied successfully!" -ForegroundColor Green

# Stage all changes
Write-Host "Staging changes..." -ForegroundColor Green
git add -A

# Commit
Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Apply all fixes: venue-source mapping, ticket URLs, real images, Whelans events

- Map event sources to correct venues using venueToSourceMap
- Update ticket URLs to link to venue-specific event pages
- Replace placeholder image URLs with real Unsplash URLs
- Update Whelans events to match real venue schedule (The Amazons & Runthered)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub! Deployment should start on Railway." -ForegroundColor Green
    Write-Host "Waiting 5 seconds before reseeding database..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    Write-Host "Reseeding database..." -ForegroundColor Green
    $response = Invoke-WebRequest -Uri "https://web-production-8e062.up.railway.app/api/seed?key=dev-secret-key"
    Write-Host "Database reseeding response: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "All fixes deployed and database reseeded! Check the app at https://web-production-8e062.up.railway.app" -ForegroundColor Green
} else {
    Write-Host "Error pushing to GitHub. Check your credentials and network connection." -ForegroundColor Red
}
