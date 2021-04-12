while true; do # Loop forever
    if npm start; then   # If we exited successfully
        echo "Restarting"
        if [[ "$1" == "--no-update-check" ]]; then
            echo "Not checking for updates"
            continue    # Restart the loop
        fi
        # Attempt to update dependencies
        COMMITFILE=./.commit
        LATESTCOMMIT=`git show | grep "commit " | cut -c8-14`
        echo "Last commit:  " `cat $COMMITFILE`
        echo "Latest commit: $LATESTCOMMIT"
        if [ -f "$COMMITFILE" ] && [ `cat $COMMITFILE` == "$LATESTCOMMIT" ]; then  # We're up to date
            continue    # Restart the loop
        else
            echo "Saving commit to file"
            echo $LATESTCOMMIT > $COMMITFILE # Save the commit we're on now
            # If package.json was modified
            if git diff-tree --no-commit-id --name-only -r $LATESTCOMMIT | grep package.json
            then
                npm ci # Install updated/new dependencies
            fi
        fi
    else
        break
    fi
done
echo "Press any key to continue"
read -n 1
