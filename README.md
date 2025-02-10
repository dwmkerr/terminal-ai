# terminal-ai

Effortless AI in your terminal.

[![main](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml/badge.svg)](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml) ![npm (scoped)](https://img.shields.io/npm/v/%40dwmkerr/terminal-ai) [![codecov](https://codecov.io/gh/dwmkerr/terminal-ai/graph/badge.svg?token=uGVpjGFbDf)](https://codecov.io/gh/dwmkerr/terminal-ai)

Quickly turn on, turn off, list, show costs and connect to your AWS instances. Great for saving costs by running servers in the cloud and starting them only when needed.

## Quickstart

Install Terminal AI:

```bash
npm install @dwmkerr/terminal-ai
```

Run the tool to configure your environment and start interactively interfacing with AI:

```bash
ai
```

That's it.

Every feature can be used as a command or in an interactive session.

The quickest way to learn how to use the tool is to look at the [#examples](#examples). Each [command](#command) is documented below.

<!-- vim-markdown-toc GFM -->

- [Examples](#examples)
- [Commands](#commands)
    - [`ai config`](#ai-config)
- [API Key](#api-key)
- [Configuration](#configuration)
- [Developer Guide](#developer-guide)
    - [Debugging](#debugging)
    - [Debug Commands](#debug-commands)
    - [Error Handling](#error-handling)
    - [Terminal Recording / asciinema](#terminal-recording--asciinema)
    - [Concepts](#concepts)
- [Design Goals](#design-goals)
- [Technical Documentation](#technical-documentation)
    - [Context](#context)
    - [Context Prompts](#context-prompts)
- [TODO](#todo)

<!-- vim-markdown-toc -->

## Examples

WIP

## Commands

WIP

### `ai config`

Shows the current configuration, which is loaded from the configuration files in the [`~/.ai`] folder, environment variables (and in the future) from local `.ai` files:

```
$ ai
{
  "openAiApiKey": "<secret>",
  "prompts": {
    "chat": {
```


## API Key

An OpenAI API key is needed to be able to make calls to ChatGPT. At the time of writing a subscription fee is needed to create an API key. Create an API key by following the instructions at:

https://platform.openai.com/api-keys

Once you have your API key you can configure it in the `ai` tool by running `ai` or `ai init`.

## Configuration

A local `boxes.json` file can be used for configuration. The following values are supported:

```
{
  "boxes": {
    /* box configuration */
  },
  "aws": {
    "region": "us-west-2"
  },
  "archiveVolumesOnStop": true,
  "debugEnable": "boxes*"
}
```

Box configuration is evolving rapidly and the documentation will be updated. The AWS configuration is more stable.

## Developer Guide

Clone the repo, install dependencies, build, link, then the `boxes` command will be available:

```bash
git clone git@github.com:dwmkerr/boxes.git
# optionally use the latest node with:
# nvm use --lts
npm install
npm run build
npm link boxes # link the 'boxes' command.

# Now run boxes commands such as:
boxes list

# Clean up when you are done...
npm unlink
```

The CLI uses the current local AWS configuration and will manage any EC2 instances with a tag named `boxes.boxid`. The value of the tag is the identifier used to manage the specific box.

Note that you will need to rebuild the code if you change it, so run `npm run build` before using the `boxes` alias. A quick way to do this is to run:

```bash
npm run relink
```

If you are developing and would like to run the `boxes` command without relinking, just build, link, then run:

```bash
npm run build:watch
```

This will keep the `./build` folder up-to-date and the `boxes` command will use the latest compiled code. This will *sometimes* work but it might miss certain changes, so `relink` is the safer option. `build:watch` works well if you are making small changes to existing files, but not if you are adding new files (it seems).

### Debugging

The [`debug`](https://github.com/debug-js/debug) library is used to make it easy to provide debug level output. Debug logging to the console can be enabled with:

```bash
AI_DEBUG_ENABLE="1" npm start
```

The debug namespaces can be configured like so:

```bash
AI_DEBUG_NAMESPACE='ai*'
```

### Debug Commands



### Error Handling

To show a warning and terminate the application, throw a `TerminatingWarning` error:

```js
import { TerminatingWarning } from "./errors.js";
throw new TerminatingWarning("Your AWS profile is not set");
```

### Terminal Recording / asciinema

To create a terminal recording for the documentation:

- Install [asciinema](https://asciinema.org/) `brew install asciinema`
- Check that you have your profiles setup as documented in `./scripts/record-demo.sh`
- Run the script to start a 'clean' terminal `./scripts/record-demo.sh`
- Download your recording, e.g. to `./docs/620124.cast`
- Install [svg-term-cli](https://github.com/marionebl/svg-term-cli) `npm install -g svg-term-cli`
- Convert to SVG: `svg-term --in ./docs/620124.cast --out docs/democast.svg --window --no-cursor --from=1000`

The demo script is currently:

- `boxes ls`
- `boxes start steambox`
- `boxes costs --yes`
- `boxes ssh torrentbox`
- `boxes stop steambox`
- `boxes ls`

### Concepts

**Actions** - these are commander.js functions that are called by the CLI. They should validate/decode parameters and ask for missing parameters. They will then call a **command**.
**Commands** - these are the underlying APIs that the CLI offers - they are agnostic of the command line interface (and could therefore be exposed in a web server or so on).

## Design Goals

- **Interactive by default** - with no input, `ai` is friendly and interactive. Everything that can be done interactively can be done non-interactively. Interactive operations hint at how to run non-interactively.

## Technical Documentation

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


## TODO

Quick and dirty task-list.

**Chat - book preview ready**

- [ ] fix: if we have any multiline in the output, or we have a markdown block, then start the response with a newline
- [ ] fix: if we are writing to a file, put in markdown but strip all colors.
- [ ] fix: if we have parameter input we still need to decode intent
- [x] reply/copy/quit options - offer file output for example
- [x] copy action, save action
- [x] nth: just show the response prompt, but if empty response show actions
- [ ] document chat
- [ ] nth: chat command needs error handling

**Book Ready**

- [ ] nth: init command

**Code - book ready**

- [ ] code: interactive
- [ ] nth: code - non interactive

**Documentation - book ready**

- [ ] nth: terminal recording

**Epic - Output Modes**

Enable the `<output>: input` format for chats, e.g. to go straight to file

- [ ] feat: custom inqurirer module to handle keypresses and toggle the input prompt

**Chat**

- [ ] nth: see if we can auth user/pass instead of using an API key
- [ ] nth: decide on whether a response prompt is needed. For a single line response it is probably good, for multi-line it is probably unneeded, for a single line of code it is likely not needed, consider either heuristics or configuration options
- [ ] nth: support reflow with marked-terminal to more gracefully show output
- [ ] nth: 'compact' option for action menu
- [ ] nth: clean up the prompt for next action as well as the code
- [ ] nth: decide how to trim markdown and space output. It might be based on whether the output is multi-line and so on
- [ ] nth: give code blocks more of a background so that they are more readable

---

- [ ] bug: printError shows an empty square brackets at the end
- [ ] bug(build): remove the disable deprecation warnings code and fix the punycode issues
- [ ] bug(build): don't include source - just dist
- [ ] bug(ai): on startup the default yaml config should be copied over?
- [ ] bug(chat): when non-interactive if API key is not set, error message must be plain text
- [ ] devex: 'ai' local command to run from my folder

- [ ] nth(chat): line up input/output prompts on the colon

- [ ] nth: 'vanilla' flag (no prompts)
- [ ] fix(config): hide sensitive values by default

- [ ] minor: consider what heading/title to run when init-ing the key or first time interactive.

- [ ] really user friendly way to get API key set
- [ ] we can check first time run via presence of config file
- [ ] Call from vi example
- [ ] Put in effective shell chapter
- [ ] Check competitors
- [ ] Spinners
- [ ] Interactive mode shows prompt in green press up down to cycle modes
- [ ] Chat mode default
- [ ] Output: file -suggestion name and format eg ics 
- [ ] Clipboard
- [ ] Structure: context prompt / input prompt / text / output mode
- [ ] GitHub mode
- [ ] Vanilla mode
- [ ] Online instructions for api key
- [ ] Videos on LinkedIn
- [ ] When code is shown offer copy command
- [ ] Execution context tty 
- [ ] Location specific prompts, eg create a .ai folder, include prompts in it, tai shows them
- [ ] docs: readline/prompt input keyboard shortcuts (cancel, copy, etc)
- [ ] nth: unhandled error prettier printing
