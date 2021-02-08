Write-Output "Starting"
while ($true) {
    npm start
    if ($?) { # If we updated successfully
        Write-Output "Restarting"
        if ($args[0] -eq "--no-update-check") {
            Write-Output "Not checking for updates"
            continue
        }

        # Attempt to update dependencies
        $COMMITFILE = ".\.commit"
        try {
            $LAST_COMMIT = Get-Content -Path $COMMITFILE
        } catch {
            $LAST_COMMIT = ""
        }
        $LATEST_COMMIT = @(git show)[0].substring(7, 7)
        if ((Test-Path $COMMITFILE) -and $LAST_COMMIT -eq $LATEST_COMMIT) {
            continue
        }
        Write-Output "Saving commit to file"
        Out-File -FilePath $COMMITFILE -InputObject $LATEST_COMMIT
        if (@(git diff-tree --no-commit-id --name-only -r $LATEST_COMMIT) -contains "package.json") {
            npm install
        }
    } else {
        break;
    }
}