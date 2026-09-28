@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo.
echo ========================================
echo Committing Dublin Events App Fixes
echo ========================================
echo.

echo Staging files...
git add next.config.js
git add "src/app/api/events/route.ts"
git add "src/app/api/events/[id]/route.ts"
git add "src/app/api/queue/health/route.ts"

echo.
echo Git Status:
git status

echo.
echo Committing changes...
git commit -m "fix: add dynamic route export and clean next.config.js

Problems:
1. API routes attempting static generation requiring DATABASE_URL
2. Invalid config option isrMemoryCacheSize
3. Prisma queries failing during Collecting page data phase

Solutions:
1. Added export const dynamic = force-dynamic to all API routes
2. Removed invalid configuration options from next.config.js
3. Simplified next.config.js to essential configuration only

Result: All API routes skip static generation and render dynamically"

echo.
echo Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ SUCCESS! Changes pushed to GitHub
    echo Railway webhook triggered - deployment in progress
    echo.
    pause
) else (
    echo.
    echo ✗ ERROR during push!
    echo.
    pause
    exit /b 1
)
