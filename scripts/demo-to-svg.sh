# Setup:
# brew install agg

# Convert the cast to SVG.
svg-term --in ./docs/casts/new-recording.cast --out docs/casts/new-recording.svg --window --no-cursor --from=100

# Create a gif, useful for sharing online.
agg --theme solarized-dark ./docs/casts/new-recording.cast ./docs/casts/new-recording.gif
agg --theme github-dark --renderer fontdue ./docs/casts/new-recording.cast ./docs/casts/new-recording.gif
