# TODO

Quick and dirty task-list.

My personal most wanted:

- Show pull requests, merge locally, push remote (e.g. hacker laws weekly update).

Bigger questions:

- When we 'copy' or 'exec' - should we try and grab the latest code block?

<!-- vim-markdown-toc GFM -->

- [Version 0.10](#version-010)
- [Version 0.11](#version-011)
- [Version next](#version-next)
- [Version next+1](#version-next1)
- [Inquirer Fixes / Features](#inquirer-fixes--features)
- [Epic - Assisants API](#epic---assisants-api)
- [Epic - GitHub Intent/Tool](#epic---github-intenttool)
- [Tobias Ideas](#tobias-ideas)
- [Alpha](#alpha)
- [Beta](#beta)
- [Documentation](#documentation)
- [Global](#global)
- [Actions: Execute](#actions-execute)
- [Configuration](#configuration)
- [Commands: Chat](#commands-chat)
- [Commands: Config](#commands-config)
- [Commands: Init](#commands-init)
- [GitHub Output Intent](#github-output-intent)
- [File Output Intent](#file-output-intent)
- [NTH: Vim Integration / Demo](#nth-vim-integration--demo)
- [Epic: Model Comparison](#epic-model-comparison)
- [Testing](#testing)
- [Random Ideas](#random-ideas)

<!-- vim-markdown-toc -->

## Version 0.10

- [x] feat(shell): accept stdin content and send as a file named 'stdin'
- [x] docs(shell): 'summarise this diff in 10 lines max'

## Version 0.11

- [ ] refactor(shell): tech debt task in v11 to stabalise input and extract/test
- [ ] bug: ctrl+c on actions menu doesn't close it
- [ ] bug: pasting multi-line code doesn't work for input. Fix: on 'paste', if we detect multi line input open the editor input. This should also be an action in the actions menu. We could probably do the upload file input at the same time. This also requires a fix at the InquirerJS level.
- [ ] feat(shell): consider 'forceTTY' to allow the user to restart chat by reading all of stdin then reopening it for user input: NOTE doesn't seem possible

**10 Stars - Automated Quality & Tooling**

- [ ] github action
- [ ] fix(chat): save conversation shouldn't include context

**30 Stars - Providers + Models**

- [ ] feat(providers): select provider

## Version next

- [ ] `ai usage` to check credits
- [ ] show model quickly/easily - change model easily?
- [ ] copy code block would be nice

## Version next+1

- stream from stdin, eg. `ai -- "cleanup my vimrc" < ~/.vimrc`
- [ ] shell shortcut such as Mac+I (see how sgpt did it?)
- [ ] if an assistant only feature is required offer the option to change

## Inquirer Fixes / Features

- [ ] feat: hint / prompt / placeholder: grey placeholder text would really help, 

**Resilience**

- [ ] bug: on connectivity, we see an OpenAI Error rather than connection error - related:
- [ ] if a chat fails due to connection offer option to retry

**Code Blocks**

- [ ] execute code blocks should extract last block
- [ ] copy code blocks should copy last block
- [ ] save code blocks should save last block

**File Upload**

- [ ] specify files in params
- [ ] refactor to use assistants api
- [ ] upload files, use spinner
- [ ] add file action
- [ ] pipe file in via stdin - use chat parameter (e.g. git diff | ai "summarise" | git commit)

**Deploy**

- [ ] deploy as prerelease and est for a week

- [ ] local .ai config - context prompts only
- [ ] to check: system prompts for context

- deepseek
- If running for the first time, choose 'init'. Note that if running `ai init` this is not needed... (`await firstTimeInit` in each command? what about `ai config` - also, first time init should have a very clear API message (see 'ensureApiKey'), but maybe only for the first time? EnsureAPIKey can then likely be removed from 'chat' - and possibly completely.
- [ ] bug(chat): terminal overwrite bugs on multiline

## Epic - Assisants API

- first option is to run in parallel
- option to enable/disable streaming

## Epic - GitHub Intent/Tool

- Are tools available on Deepseek as well

## Tobias Ideas

- local promts
- github copilo api
- e.g. git diff - bug check - husky?

## Alpha

- Replace commonjs with modules (package.json type)
- Shell installer?

## Beta

- Brew installer? Bundler? Note that local `prompts/` folder will need to be bundled

## Documentation

- Configuration Files and Structure
- Interactive modes / TTY / how to enable/disable.
- [ ] Structure: context prompt / input prompt / text / output mode

## Global

- [ ] feat: no tty flag
//  TODO: if the 'verbose' flag has been set, log the error object.
- [ ] bug(build): remove the disable deprecation warnings code and fix the punycode issues (requires ESLint 9)
- [ ] minor: consider what heading/title to run when init-ing or running any action.
- [ ] Spinners
- [ ] Handle asymmetric TTY eg pipe /dev/stdin as input and pipe to output file, or pipe echo into interactive or pipe echo into file- use context to inform if the output should use markdown or not?
- [ ] TAI: files flag, folder flag best effort
- [ ] feat(check): check connectivity

## Actions: Execute

- [ ] feat(execute): try and infer the code type and use the correct file extension to get syntax highlighting in the code editor
- [ ] fix(execute): the prompts are a little large for an 80 col view
- [ ] feat(execute): allow for command line option?

## Configuration

- [ ] feat: openai model configuration
- [ ] feat: advanced config option
- [ ] use local `.ai` files:
- [ ] Location specific prompts, eg create a .ai folder, include prompts in it, tai shows them
- [ ] feat(config): prompts should be named

## Commands: Chat

- [ ] Interactive mode shows prompt in green press up down to cycle modes
- [ ] feat: custom inqurirer module to handle keypresses and toggle the input prompt
- [ ] nth: decide on whether a response prompt is needed. For a single line response it is probably good, for multi-line it is probably unneeded, for a single line of code it is likely not needed, consider either heuristics or configuration options
- [ ] nth: support reflow with marked-terminal to more gracefully show output
- [ ] nth: clean up the prompt for next action as well as the code
- [ ] nth: decide how to trim markdown and space output. It might be based on whether the output is multi-line and so on
- [ ] nth: give code blocks more of a background so that they are more readable
- [ ] nth(chat): line up input/output prompts on the colon
- [ ] docs: readline/prompt input keyboard shortcuts (cancel, copy, etc)

## Commands: Config

- [ ] fix(config): hide sensitive values by default

## Commands: Init

- [ ] nth: init command

## GitHub Output Intent

- [ ] feat: create/list bugs
- [ ] GitHub: Read repo from .git, Env var and token in config
- [ ] GitHub tree folder structure for context, offer option to ask for files

## File Output Intent

- [ ] Output: file -suggestion name and format eg ics 

## NTH: Vim Integration / Demo

- [ ] Call from vi example

## Epic: Model Comparison

Essentially what was done earlier with the Assistants API - an option to run the chats through multiple models to compare results.

## Testing

- [ ] Future: test responses from ChatGPT expected-ish eg code intent has a single code block only, score results as a percentage based on expectations

## Random Ideas

- [ ] terminal recording
- [ ] terminal pair programming
