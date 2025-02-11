# For this script to work:
# 1. make sure you have an iterm profile named 'dwmkerr-recording'
# 2. This profile is in my dotfiles
# 3. The profile should be windowed, and sized to 80x15.
osascript <<EOF
tell application "iTerm"
    set newWindow to (create window with profile "dwmkerr-recording")
    tell current session of newWindow
        write text "clear"
        write text "cd ~/repos/github/dwmkerr/terminal-ai"
        write text "asciinema rec --overwrite --title 'Terminal AI' ~/repos/github/dwmkerr/terminal-ai/docs/casts/new-recording.cast"
    end tell
end tell
EOF
