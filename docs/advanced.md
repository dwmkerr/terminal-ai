# Advanced

Advanced features.

Force color output (useful if you are piping and need color codes):

```bash
# Force color output:
# - set FORCE_COLOR=1
# - ascii formatting will be applied even if stdout is not a tty
# - use 'less -r' (-r = raw, render color codes) as a way to quickly test.
FORCE_COLOR=1 ai 'show me some markdown features' | less -r
```

Example of how to interactively stage, generate a conventional commit:

- [`aigac.sh`](./docs/casts/aigac.sh) - AI Git Add Commit shell script

<a href="./docs/casts/aigac.svg"><img width="480px" src="./docs/casts/aigac.svg" /></a>

