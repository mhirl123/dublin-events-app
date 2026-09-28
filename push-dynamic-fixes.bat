@echo off
cd /d "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

echo Staging files...
git add src\app\layout.tsx src\app\page.tsx src\app\dashboard\page.tsx "src\app\events\[id]\page.tsx"

echo Committing changes...
git commit -m "feat: disable static generation for all pages to fix deployment memory issue

- Added 'export const dynamic = force-dynamic' to root layout.tsx
- Added 'export const dynamic = force-dynamic' to home page (page.tsx)
- Added 'export const dynamic = force-dynamic' to dashboard page
- Added 'export const dynamic = force-dynamic' to event detail page

These changes prevent Next.js from attempting static site generation (SSG) at build time, which was causing out-of-memory errors when collecting page data for all 200+ event pages. With dynamic rendering enabled, pages are rendered on-demand instead."

echo Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Success! Changes pushed to GitHub.
    echo Railway will automatically redeploy via webhook.
    pause
) else (
    echo.
    echo ✗ Error! Push failed. Check git status and try again.
    pause
)
