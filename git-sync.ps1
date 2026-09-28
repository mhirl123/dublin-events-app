Set-Location "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

Write-Host "Step 1: Pulling latest from origin/main..."
git pull origin main

Write-Host "`nStep 2: Stashing uncommitted changes..."
git stash

Write-Host "`nStep 3: Pushing local commits to origin/main..."
git push origin main

Write-Host "`nGit sync complete!"
Read-Host "Press Enter to exit"
