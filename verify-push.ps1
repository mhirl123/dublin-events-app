cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"
$output = @()
$output += "=== Git Status ==="
$output += git status
$output += ""
$output += "=== Latest Commit ==="
$output += git log -1 --oneline
$output += ""
$output += "=== Branch Info ==="
$output += git branch -vv
$output | Out-File -FilePath "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\verify-output.txt" -Encoding UTF8
