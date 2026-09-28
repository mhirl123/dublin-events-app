@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
git add src/lib/queue/bullConfig.ts
git commit -m "Fix: Revert default export to scraperQueue Proxy"
git push origin main
echo.
echo Push completed!
pause
