# - Install [asciinema](https://asciinema.org/) `brew install asciinema`
# - Check that you have your profiles setup as documented in `./scripts/record-demo.sh`
# - Run the script to start a 'clean' terminal `./scripts/record-demo.sh`
# - Download your recording, e.g. to `./docs/620124.cast`
# - Install [svg-term-cli](https://github.com/marionebl/svg-term-cli) `npm install -g svg-term-cli`
# - Convert to SVG: `./scripts/demo-to-svg.sh`
#
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
    end tell
end tell
EOF
