Set objShell = CreateObject("WScript.Shell")
strCmd = "cd /d C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete && git add src/app/api/stats/route.ts && git add src/app/api/venues/route.ts && git add src/app/api/genres/route.ts && git add src/app/api/sources/route.ts && git commit -m ""Fix: Add dynamic rendering to API routes to prevent build-time errors"" && git push origin main"
objShell.Run strCmd, 0, True
