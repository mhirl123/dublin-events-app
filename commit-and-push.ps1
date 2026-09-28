# Navigate to the repository
cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

# Add the modified files
git add src/app/api/stats/route.ts
git add src/app/api/venues/route.ts
git add src/app/api/genres/route.ts
git add src/app/api/sources/route.ts

# Commit with a descriptive message
git commit -m "Fix: Add dynamic rendering to API routes to prevent build-time errors

- Added 'export const dynamic = force-dynamic' to:
  - src/app/api/stats/route.ts
  - src/app/api/venues/route.ts
  - src/app/api/genres/route.ts
  - src/app/api/sources/route.ts

This prevents PrismaClientInitializationError during static generation
and allows proper runtime database access for request-dependent routes."

# Push to GitHub
git push origin main

# Display completion status
Write-Host "Commit and push completed successfully!"
