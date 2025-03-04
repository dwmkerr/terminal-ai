#!/usr/bin/env bash

aigac() {
    # Interactively stage changes.
    git add --patch

    # If there's no changes, bail.
    if git diff --cached --quiet; then
        echo "No changes staged for commit."
        return 1
    fi

    # Generate the commit message using terminal-ai. Pipe it into 'git commit'
    # by using the '-F -' (i.e. read from the stdin file). Make sure we edit it
    # in the editor first with '-e'.
    git diff --cached |\
      ai -- 'summarise this git diff into a conventional commit, e.g. feat(feature): short description\n\nlong description' |\
      git commit -e -F - 
}

