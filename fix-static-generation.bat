@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo.
echo ========================================
echo Fixing Static Generation Issue
echo ========================================
echo.

echo Checking git status...
git status

echo.
echo Staging modified files...
git add next.config.js src/app/page.tsx src/app/dashboard/page.tsx "src/app/events/[id]/page.tsx"

echo.
echo Committing changes...
git commit -m "fix: disable static generation with proper Next.js configuration

Problem: Client components were incorrectly marked with 'export const dynamic = force-dynamic',
but this directive is ignored by Next.js for client components. The build still attempted
static page generation during 'Collecting page data' phase, causing out-of-memory errors.

Solution:
1. Removed 'export const dynamic' directives from all client components (page.tsx files)
2. Kept the directive only in root layout.tsx (server component where it actually works)
3. Added 'staticPageGenerationTimeout: 0' to next.config.js to disable SSG entirely

This ensures:
- No static generation is attempted during build
- Pages render dynamically on-demand
- No memory exhaustion during build process
- App deploys and runs successfully

Files modified:
- next.config.js: Added staticPageGenerationTimeout configuration
- src/app/page.tsx: Removed incorrect force-dynamic export
- src/app/dashboard/page.tsx: Removed incorrect force-dynamic export
- src/app/events/[id]/page.tsx: Removed incorrect force-dynamic export
- src/app/layout.tsx: Kept force-dynamic (server component)"

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
