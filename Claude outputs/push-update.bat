@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo.
echo ========================================
echo Committing Next.js Configuration Update
echo ========================================
echo.

echo Checking git status...
git status

echo.
echo Staging next.config.js...
git add next.config.js

echo.
echo Committing changes...
git commit -m "fix: increase static generation timeout and disable ISR cache

The previous timeout of 0ms was causing immediate failure during build.
Set timeout to 5 minutes (300000ms) to allow build to complete.
Also disable ISR memory cache to reduce memory usage during build phase.

These settings combined with force-dynamic export on root layout should
prevent out-of-memory errors during 'Collecting page data' phase."

echo.
echo Pushing to GitHub...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ SUCCESS! Changes pushed to GitHub.
    echo Railway will automatically redeploy via webhook.
    echo.
    pause
) else (
    echo.
    echo ✗ ERROR! Push failed. Check git status and try again.
    echo.
    pause
)
