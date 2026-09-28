@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo.
echo ========================================
echo COMMITTING AND PUSHING CORRECTED FILE
echo ========================================
echo.

echo [1/2] Adding corrected file...
git add src/app/api/jobs/scrape/route.ts

echo [2/2] Committing and pushing...
git commit -m "Fix: Correct template literal syntax in scrape route"
git push origin main -v

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Changes pushed to GitHub!
    echo ========================================
    echo Railway deployment will start automatically.
    echo.
) else (
    echo.
    echo ERROR during commit/push
    echo.
)

pause
