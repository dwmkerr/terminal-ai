<p align="center">
  <h2 align="center"><code>🧠 terminal-ai</code></h2>
      <h3 align="center">Effortless AI in the shell. Maintain your flow and be more effective.</h3>
  <p align="center">
      <img src="./docs/casts/terminal-ai-homepage.svg" alt="Demo Recording of Terminal AI" style="max-width: 100%;">
  </p>
  <p align="center">
    <a href="#quickstart">Quickstart</a> |
    <a href="#examples">Examples</a> |
    <a href="#actions">Actions</a> |
    <a href="#commands">Commands</a> |
    <a href="#configuration">Configuration</a> |
    <a href="#experimental">Experimental</a> |
    <a href="#developer-guide">Developer Guide</a>
  </p>
  <p align="center">
    <a href="https://github.com/dwmkerr/terminal-ai/actions/workflows/cicd.yaml"><img src="https://github.com/dwmkerr/terminal-ai/actions/workflows/cicd.yaml/badge.svg" alt="cicd"></a>
    <a href="https://www.npmjs.com/package/@dwmkerr/terminal-ai"><img src="https://img.shields.io/npm/v/%40dwmkerr/terminal-ai" alt="terminal-ai"></a>
    <a href="https://codecov.io/gh/dwmkerr/terminal-ai"><img src="https://codecov.io/gh/dwmkerr/terminal-ai/graph/badge.svg?token=oHFSLfOHGd" alt="codecov"></a>
  </p>
</p>

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

Quick links:

- [Simple Chat](#simple-chat)
- [Initialising or Updating Config](#initialising-or-updating-config)
- [Multiline Input](#multiline-input)
- [Copying to the Clipboard or Saving to a File](#copying-to-the-clipboard-or-saving-to-a-file)
- [Writing Code](#writing-code)
- [Executing Scripts](#executing-scripts)
- [Piping Input](#piping-input)
- [Advanced](#advanced)

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

### Initialising or Updating Config

Set or update your configuration (such as the OpenAI API key) with the `ai init` command:

![Demo Recording of a the 'ai init' command](./docs/casts/ai-init.svg)

Run this command with:

```bash
ai init
```

### Multiline Input

To provide multiline input (or paste multiple lines input input) you can use the Actions Menu to select the 'Chat (Multiline)' action. Just press <code>Enter</code> at the prompt. Your `$EDITOR` will open:

![Demo Recording of Multiline Input](./docs/casts/ai-chat-multiline.svg)

### Copying to the Clipboard or Saving to a File

Open the Actions menu with 'Enter' and choose 'Copy Response'. The most recent message will be copied. To save a file, use the 'Save Response' action.

You can copy to the clipboard by specifying the `-c` or `--copy` parameter:

```bash
ai -c -- "Travel time for London to Paris?"
```

You can also copy to the clipboard by piping to a program like `pbcopy`. This example uses the `code` intent to ask for code output only and writes to the clipboard:

```bash
ai -- "code: bash script to zip all files in current directory" | pbcopy
```

### Multliline Input

To provide multiline input (or paste multiple lines input input) you can use the Actions Menu to select the 'Chat (Multiline)' action. Just press <code>Enter</code> at the prompt. Your `$EDITOR` will open:

![Demo Recording of Multiline Input](./docs/casts/ai-chat-multiline.svg)

### Writing Code

If you want a response to only contain code, prefix your message with `code:`. This makes it much easier to create a response which is ready to be pasted into a file or saved and executed:

![Demo Recording of Code Output](./docs/casts/code-output-intent.svg)

To run as a command:

```bash
ai -- "code: Python code to find largest file in current directory" > findfile.py
```

The `code` output intent tries to ensure that a _single_ code block is created, rather than multiple blocks in multiple languages. It does this by asking for a single listing with comments used to indicate whether other scripts or operations are needed.

### Executing Scripts

You can execute scripts by asking for `code` output, pressing 'Enter' in the response prompt to open the Actions menu and then choosing 'Execute Response'. Terminal AI will ask you to verify the code (using your configured `$EDITOR`) and then ask for confirmation before executing:

![Demo Recording of Execute Response](./docs/casts/ai-chat-exec.svg)

### Piping Input

You can pipe content to `ai` - in this example the current uncommitted changes in a repo are analysed:

![Demo Recording of Piping Stdin](./docs/casts/stdin-pipe-git-diff.gif)

Tips:

- You must provide a prompt, e.g: `git diff | ai -- 'do I have enough tests?`
- You can also pipe the results, e.g: `gif diff | ai -- 'write a git patch that adds tests' > tests.patch`
- You can refer to the input with the file name `stdin`, e.g: `ai -- 'how many words in stdin?' < dictionary.txt`

### Advanced

Advanced or experimental features.

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

## Actions

When you press `Enter` in the chat prompt, the Actions menu will pop up. These actions offer additional features to work with AI.

### Change Model

The 'Change Model' action allows you to change the model that is in use:

![Cast: The 'Change Model' Action](./docs/casts/actions-select-model.cast.svg)

Models which have been extensively tested and verified to work with Terminal AI are shown in the list first, along with a short description of the model and its capabilities. Models which are offered by AI APIs but have not been extensively tested are shown next.

You can also provide the ID of any model that is _not_ in the list by changing the `model` setting in the [Configuration](#Configuration).

Verified models are provided by the [`ai-providers-and-models`](https://github.com/dwmkerr/ai-providers-and-models) project.

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

| Parameter              | Description                                                            |
|------------------------|------------------------------------------------------------------------|
| `-c, --copy`           | Copy response to the clipboard and exit.                               |
| `-r, --raw`            | Do not format markdown or change the response in any way.              |
| `--assistant`          | (Experimental). Use the Assistants API rather than the Completions API. |
| `--no-context-prompts` | Disable context prompts (e.g. 'my shell is bash').                     |
| `--no-output-prompts`  | Disable output prompts (e.g. 'show code only').                        |

**`ai init`**

The `ai init` commands allows you to initialise or update your configuration (such as your API key). It also offers the option to validate your configuration:

```
ai init

Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...
✔ OpenAI API Key: **************************************************
********************************************************************
**********************************************
✔ Test API Key & Configuration? Yes
Checking configuration...
OpenAP API Key validated
Configuration validated
✔ What next?: Chat
```

This command also allows advanced configuration such as the model to be updated.

**`ai check`**

The `ai check` command validates your configuration, ensuring your OpenAI API key is configured correctly:

```bash
ai check

Checking configuration...
OpenAP API Key validated
Configuration validated
```

**`ai config`**

Shows the current configuration, which is loaded from the configuration files in the [`~/.ai`] folder, environment variables and the `prompts` folder.

## Error Codes

The following error codes can be returned by `ai`:

| Code | Name                                | Description                      |
|------|-------------------------------------|----------------------------------|
| 1    | `ERROR_CODE_WARNING`                | A warning was shown to the user. |
| 2    | `ERROR_CODE_INVALID_CONFIFGURATION` | Network connectivity error.      |
| 3    | `ERROR_CODE_CONNECTION`             | Configuration error.             |

## API Key

An OpenAI API key is needed to be able to make calls to ChatGPT. At the time of writing a subscription fee is needed to create an API key. Create an API key by following the instructions at:

https://platform.openai.com/api-keys

Once you have your API key you can configure it in the `ai` tool by running `ai` or `ai init`.

## Configuration

Most 'stable' configuration can be specified in the `~/.ai/config.yaml` file. Experimental features might only be available in the form of environment variables.

The configuration schema is changing rapidly, the file [`./src/configuration/configuration.ts`](./src/configuration/configuration.ts) is the most authoritative source of configuration options. However, some important values are:

| Configuration | Environment     | Config         | Description                                             |
|---------------|-----------------|----------------|---------------------------------------------------------|
| Force colors. | `FORCE_COLOR=1` | n/a            | Force ASCII color codes in output even if it not a TTY. |
| OpenAI Model  | n/a             | `openai.model` | OpenAI API model to use, default is `gpt-3.5-turbo`     |

**OpenAI Model**

Any text value can be used for the model. The `ai check` command will make a best-effort attempt to validate that the model is correct by calling a chat API. The `ai init` command also tries to be helpful by showing a list of pre-defined models that have been loaded from the OpenAI APIs, and validated against [`ai-providers-and-models`](https://github.com/dwmkerr/ai-providers-and-models). However models are changing rapidly and new ones may take time to be incorporated. However there is nothing stopping you from simply entering any new model ID in the config file.

## Experimental

**Assistants API**

You can try using the [Assistants APIs](https://platform.openai.com/docs/assistants/overview) rather than the [Completions APIs](https://platform.openai.com/docs/guides/completions) with the `--assistant` flag:

```bash
ai --assistant -- "Who are you?"
```

Note that responses will be considerably slower and more API calls will be made.

## Developer Guide

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
