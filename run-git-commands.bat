@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
schtasks /create /tn "GitCommitAndPush" /tr "cmd /c git add src/app/api/stats/route.ts src/app/api/venues/route.ts src/app/api/genres/route.ts src/app/api/sources/route.ts && git commit -m \"Fix: Add dynamic rendering to API routes to prevent build-time errors\" && git push origin main" /sc once /st 00:00 /f 2>nul
schtasks /run /tn "GitCommitAndPush" /f
schtasks /delete /tn "GitCommitAndPush" /f 2>nul
pause
