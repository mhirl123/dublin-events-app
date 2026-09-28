@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
echo.
echo Pushing commit to GitHub...
echo.
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Commit pushed to GitHub.
    echo ========================================
    echo Railway deployment should start automatically.
    echo Check the Railway dashboard in a few moments.
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo ERROR: Git push failed.
    echo ========================================
    echo Please check your GitHub credentials are configured.
    echo.
    pause
)
