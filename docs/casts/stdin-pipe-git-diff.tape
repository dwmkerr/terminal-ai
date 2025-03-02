# Notes:
# Apply patch with:
# git reset --soft HEAD~3 9f06cad

# Where should we write the GIF?
Output stdin-pipe-git-diff.gif

# Set up a 1200x600 terminal with 46px font.
Set FontSize 18
Set Width 1200
Set Height 600

# Pipe a diff to ai, force color (as we're recording it doesn't think we have a
# TTY).
Env FORCE_COLOR "1"

Type "git diff | ai 'most elegant code block in this diff, 2 line summary'"
Enter
Wait@60s

# Admire the output for a bit.
Sleep 15s
