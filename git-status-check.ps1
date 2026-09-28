cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
$status = git status --porcelain src/lib/queue/bullConfig.ts
if ($status) {
    "UNCOMMITTED" | Out-File -FilePath "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\git-check-result.txt"
} else {
    "COMMITTED" | Out-File -FilePath "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\git-check-result.txt"
    "Latest commit:" | Add-Content -Path "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\git-check-result.txt"
    git log -1 --oneline | Add-Content -Path "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\git-check-result.txt"
}
