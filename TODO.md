# TODO

Quick and dirty task-list.

<!-- vim-markdown-toc GFM -->

- [Version 0.6](#version-06)
- [Version 0.7](#version-07)
- [Version 0.8](#version-08)
- [Documentation](#documentation)
- [Global](#global)
- [Configuration](#configuration)
- [Commands: Chat](#commands-chat)
- [Commands: Config](#commands-config)
- [Commands: Init](#commands-init)
- [GitHub Output Intent](#github-output-intent)
- [File Output Intent](#file-output-intent)
- [NTH: Vim Integration / Demo](#nth-vim-integration--demo)
- [Testing](#testing)
- [Random Ideas](#random-ideas)

<!-- vim-markdown-toc -->

## Version 0.6

- [x] feat(check): basic check command
- [x] bug(chat): when non-interactive if API key is not set, error message must be plain text
- [x] nth: unhandled error prettier printing
- [x] bug: printError shows an empty square brackets at the end
- [x] nth: chat command needs error handling
- [x] feat(init): create config (OpenAI key / leave empty for default), validate key, choose model
- [ ] feat(chat): copy to clipboard flag
- [ ] bug(build): don't include source - just dist
- [ ] bug(chat): terminal overwrite bugs on multiline

## Version 0.7

## Version 0.8

If running for the first time, choose 'init'. Note that if running `ai init` this is not needed... (`await firstTimeInit` in each command? what about `ai config` - also, first time init should have a very clear API message (see 'ensureApiKey'), but maybe only for the first time? EnsureAPIKey can then likely be removed from 'chat' - and possibly completely.

## Documentation

- Configuration Files and Structure
- Interactive modes / TTY / how to enable/disable.
- [ ] Structure: context prompt / input prompt / text / output mode

## Global

- [ ] feat: no tty flag
- [ ] nth: 'vanilla' flag (no prompts) - or one to not format markdown?
- [ ] bug(build): remove the disable deprecation warnings code and fix the punycode issues (requires ESLint 9)
- [ ] minor: consider what heading/title to run when init-ing or running any action.
- [ ] Spinners
- [ ] Handle asymmetric TTY eg pipe /dev/stdin as input and pipe to output file, or pipe echo into interactive or pipe echo into file- use context to inform if the output should use markdown or not?
- [ ] TAI: files flag, folder flag best effort

## Configuration

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

## Testing

- [ ] Future: test responses from ChatGPT expected-ish eg code intent has a single code block only, score results as a percentage based on expectations

## Random Ideas

- [ ] terminal recording
- [ ] terminal pair programming
