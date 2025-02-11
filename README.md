# terminal-ai

Effortless AI in your terminal.

[![main](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml/badge.svg)](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml) ![npm (scoped)](https://img.shields.io/npm/v/%40dwmkerr/terminal-ai) [![codecov](https://codecov.io/gh/dwmkerr/terminal-ai/graph/badge.svg?token=oHFSLfOHGd)](https://codecov.io/gh/dwmkerr/terminal-ai)

![Demo Recording of Terminal AI](./docs/casts/terminal-ai-homepage.svg)

[Quickstart](#quickstart) | [Examples](#examples) | [Commands](#commands) | [Developer Guide](#developer-guide)

## Quickstart

Install Terminal AI:

```bash
npm install @dwmkerr/terminal-ai
```

Run the tool to configure your environment and start interactively interfacing with AI:

```bash
ai
```

That's it. The quickest way to learn how to use the tool is to look at the [Examples](#examples).

## Examples

### Simple Chat

To chat, run `ai` and follow the prompts. If you press 'Enter' in the chat prompt instead of replying then the actions menu will pop up with more options:

![Demo Recording of a Simple Chat with Terminal AI](./docs/casts/simple-chat.svg)

To execute a chat command, pass your message as a parameter. Note that you should always separate the message parameter from any other flags or commands by using the `--` separator:

```
ai -- "How can I programatically create a calendar invite?"
```

If `ai` detects that you are using a TTY then it will prompt you to continue the conversation. If you are not, the message will be responded to and the tool will close:

```
ai -- "How can I programatically create a calendar invite?" > answer.txt
```

### Copying to the Clipboard or Saving to a File

Open the Actions menu with 'Enter' and choose 'Copy Response'. The most recent message will be copied. To save a file, use the 'Save Response' action.

### Writing Code

If you want a response to only contain code, prefix your message with `code:`. This makes it much easier to create a response which is ready to be pasted into a file or saved and executed:

![Demo Recording of Code Output](./docs/casts/code-output-intent.svg)

To run as a command:

```bash
ai -- "code: Python code to find largest file in current directory" > findfile.py
```

The `code` output intent tries to ensure that a _single_ code block is created, rather than multiple blocks in multiple languages. It does this by asking for a single listing with comments used to indicate whether other scripts or operations are needed.

## Commands

**`ai`**

The default `ai` command initiates a chat. Simply run `ai`:

```bash
ai
```

You can provide the initial message as a parameter to the tool:

```bash
ai -- "How do I install NodeJS?"
```

The following parameters are available:

| Parameter              | Description                                        |
|------------------------|----------------------------------------------------|
| `--no-context-prompts` | Disable context prompts (e.g. 'my shell is bash'). |
| `--no-output-prompts`  | Disable output prompts (e.g. 'show code only').    |

**`ai config`**

Shows the current configuration, which is loaded from the configuration files in the [`~/.ai`] folder, environment variables and the `prompts` folder:

```
$ ai
{
  "openAiApiKey": "<secret>",
  "prompts": {
    "chat": {
    ...
```

## API Key

An OpenAI API key is needed to be able to make calls to ChatGPT. At the time of writing a subscription fee is needed to create an API key. Create an API key by following the instructions at:

https://platform.openai.com/api-keys

Once you have your API key you can configure it in the `ai` tool by running `ai` or `ai init`.

## Developer Guide

Clone the repo, install dependencies, build and then run:

```bash
git clone git@github.com:dwmkerr/boxes.git

# optional: use the latest node with:
# nvm use --lts
npm install
npm start
```

If you want to install the `ai` command run the following:

```bash
npm run build
npm link ai

# Now run ai commands such as:
ai "ask me anything"

# Clean up when you are done...
npm unlink
```

Note that you will need to rebuild the code if you change it, so run `npm run build` before using the `ai` alias. A quick way to do this is to run:

```bash
npm run relink
```

If you are developing and would like to run `ai` without relinking, just build, link, then run:

```bash
npm run build:watch
```

This will keep the `./build` folder up-to-date and the `ai` command will use the latest compiled code. This can *sometimes* miss certain changes, so `relink` is the safer option. `build:watch` works well if you are making small changes to existing files, but not if you are adding new files.

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
