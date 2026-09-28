cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
git add src/app/api/stats/route.ts src/app/api/venues/route.ts src/app/api/genres/route.ts src/app/api/sources/route.ts
git commit -m "fix: add dynamic route export to remaining API routes

Add export const dynamic = 'force-dynamic' to all data-dependent API routes
to prevent static generation attempts at build time."
git push
