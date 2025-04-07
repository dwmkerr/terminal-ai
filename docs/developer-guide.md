# Developer Guide

Clone the repo, install dependencies, build and then run:

```bash
git clone git@github.com:dwmkerr/boxes.git

# optional: use the latest node with:
# nvm use --lts
npm install
npm start

# If 'actionlint' is installed, the GitHub workflows will be linted.
brew install actionlint
```

If you want to install the `ai` command run the following:

```bash
npm run build # or 'npm run build:watch' to live rebuild...
npm install -g .

# Now run ai commands such as:
ai "ask me anything" # run 'ai' again if the build has updated...

# Clean up when you are done...
npm uninstall -g .
```

### Debugging

The [`debug`](https://github.com/debug-js/debug) library is used to make it easy to provide debug level output. Debug logging to the console can be enabled with:

```bash
AI_DEBUG_ENABLE="1" npm start
```

The debug namespaces can be configured like so:

```bash
AI_DEBUG_NAMESPACE='ai*'
```

### Testing

The following commands are helpful when testing:

```bash
# Run all tests. Run tests with coverage.
npm run test
npm run test:cov

# Run (or watch, or debug) tests that match a pattern.
npm run test -- theme
npm run test:watch -- theme
npm run test:debug -- theme
```

### Terminal Recording / asciinema

To create a terminal recording for the documentation:

- Install [asciinema](https://asciinema.org/) `brew install asciinema`
- Check that you have your profiles setup as documented in `./scripts/record-demo.sh`
- Run the script to start a 'clean' terminal `./scripts/record-demo.sh`
- Download your recording, e.g. to `./docs/620124.cast`
- Install [svg-term-cli](https://github.com/marionebl/svg-term-cli) `npm install -g svg-term-cli`
- Convert to SVG: `./scripts/demo-to-svg.sh`

### Concepts

**Actions** - these are commander.js functions that are called by the CLI. They should validate/decode parameters and ask for missing parameters. They will then call a **command**.
**Commands** - these are the underlying APIs that the CLI offers - they are agnostic of the command line interface (and could therefore be exposed in a web server or so on).
**Context** - information which is provided via prompts to shape the intended output. More details below.

### Context

"Context" refers to prompts which are passed to the model before the user interacts, which can provide the model with more information about the environment of the user or their potential intent. Examples would be:

- That the user is running in a shell, with a given set of terminal dimensions
- What the operating system is that the user is running
- (WIP) the organisation and name of the local Git repo
- (WIP) the primary language of the current Git repo.

### Context Prompts

When expanding context prompts (e.g. ./prompts/chat/context/context.txt) environment variables may be used to give more specific information. As well as those provided by the system (or yourself), the following are automatically set for convenience:

| Environment Variable | Description                            |
|----------------------|----------------------------------------|
| `OS_PLATFORM`        | `nodejs os.platform()`                 |
| `TTY_WIDTH`          | The terminal width (or 80 if not set)  |
| `TTY_HEIGHT`         | The terminal height (or 24 if not set) |

## CI/CD

Required secrets:

- `TESTING_AI_API_KEY` - required to run end to end tests
