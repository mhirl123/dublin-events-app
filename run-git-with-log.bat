@echo off
setlocal enabledelayedexpansion

REM Create log file path
set logfile=C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\git-commands.log

REM Write start message
echo [%date% %time%] Starting git commit and push... > "%logfile%"

REM Change to repository directory
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete" >> "%logfile%" 2>&1

REM Check if git is available
git --version >> "%logfile%" 2>&1

REM Add files
echo [%date% %time%] Adding files... >> "%logfile%"
git add src/app/api/stats/route.ts >> "%logfile%" 2>&1
git add src/app/api/venues/route.ts >> "%logfile%" 2>&1
git add src/app/api/genres/route.ts >> "%logfile%" 2>&1
git add src/app/api/sources/route.ts >> "%logfile%" 2>&1

REM Check git status
echo [%date% %time%] Git status: >> "%logfile%"
git status >> "%logfile%" 2>&1

REM Commit
echo [%date% %time%] Committing changes... >> "%logfile%"
git commit -m "Fix: Add dynamic rendering to API routes to prevent build-time errors" >> "%logfile%" 2>&1

REM Push
echo [%date% %time%] Pushing to GitHub... >> "%logfile%"
git push origin main >> "%logfile%" 2>&1

REM Write completion message
echo [%date% %time%] Completed! >> "%logfile%"

REM Display the log file
type "%logfile%"
pause
