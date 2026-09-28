@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo.
echo ========================================
echo GIT PUSH DIAGNOSTIC
echo ========================================
echo.

echo [1/3] Checking git status...
git status
echo.

echo [2/3] Checking remote configuration...
git remote -v
echo.

echo [3/3] Attempting push with verbose output...
git push origin main -v
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Push completed.
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR CODE: %errorlevel%
    echo ========================================
    echo The push failed. Common reasons:
    echo - GitHub credentials not configured
    echo - SSH key not set up
    echo - Network connection issue
    echo.
)

pause
