# For this script to work:
# 1. make sure you have an iterm profile named 'dwmkerr-recording'
# 2. This profile should run the command: `/usr/local/bin/bash --noprofile --norc -c 'export TMUX="ignore"; bash'`
# 3. The profile should be windowed, and sized to 80x15.
osascript <<EOF
tell application "iTerm"
    set newWindow to (create window with profile "dwmkerr-recording")
    tell current session of newWindow
        write text "clear"
        write text "AWS_PROFILE=dwmkerr; /usr/local/bin/asciinema rec --overwrite --title "Boxes Demo" ~/repos/github/dwmkerr/boxes/docs/620124.cast"
    end tell
end tell
EOF
