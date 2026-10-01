cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
git apply 0001-Fix-Map-event-sources-to-correct-venues-venues-and-F.patch
git apply 0002-Fix-Update-ticket-URLs-to-link-to-venue-specific-eve.patch
git apply 0003-Fix-Replace-placeholder-image-URLs-with-real-Unsplas.patch
git apply 0004-Fix-Update-Whelans-events-to-match-real-venues-with-.patch
git add -A
git commit -m "Apply fixes: venue-source mapping, ticket URLs, real images, Whelans events"
git push origin main
Write-Host "✅ All patches applied and pushed!"
