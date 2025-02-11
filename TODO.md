# TODO

Quick and dirty task-list.

**Global**

- [ ] feat: no tty flag

**Documentation**

- Configuration Files and Structure
- Interactive modes / TTY / how to enable/disable.

**Configuration**

- [ ] use local `.ai` files:

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

**GitHub**

- [ ] feat: create/list bugs

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

**Configuration**

- [ ] feat(config): prompts should be named

---

- [ ] bug: fix skipped tests

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

