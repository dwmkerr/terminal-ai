# Setup:
# brew install agg

# Convert the cast to SVG.
svg-term --in ./docs/casts/new-recording.cast --out docs/casts/new-recording.svg --window --no-cursor --from=100

# Create a gif, useful for sharing online.
agg ./docs/casts/new-recording.cast ./docs/casts/new-recording.gif
agg --theme monokai ./docs/casts/new-recording.cast ./docs/casts/new-recording-monokai.gif
agg --theme github-dark ./docs/casts/new-recording.cast ./docs/casts/new-recording-github-dark.gif
