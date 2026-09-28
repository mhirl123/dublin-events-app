$ErrorActionPreference = "Continue"
cd "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete"

try {
    $output = @()
    $output += "=== Verification Report ==="
    $output += ""
    
    # Check git status
    $output += "Git Status:"
    $status = & git status --porcelain
    if ($status) {
        $output += "Uncommitted changes found:"
        $output += $status
    } else {
        $output += "Working tree clean - no uncommitted changes"
    }
    $output += ""
    
    # Check latest commit
    $output += "Latest commit:"
    $commit = & git log -1 --oneline
    $output += $commit
    $output += ""
    
    # Check if origin/main is up to date
    $output += "Branch tracking:"
    $branch = & git branch -vv
    $output += $branch
    
    $output | Out-File -FilePath "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\final-verify.txt" -Encoding UTF8
    Write-Host "Verification complete. Results written to final-verify.txt"
}
catch {
    $error = $_.Exception.Message
    $error | Out-File -FilePath "C:\Users\Mo Harvey\CLAUDE PROJECTS\dublin-events-app-complete\final-verify.txt" -Encoding UTF8
    Write-Host "Error: $error"
}
