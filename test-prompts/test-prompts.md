# Effective Shell Samples

<!-- vim-markdown-toc GFM -->

- [Effective Shell Samples](#effective-shell-samples)
- [Basic Terminal AI](#basic-terminal-ai)
- [Interrogating Context](#interrogating-context)
- [Other tests](#other-tests)

<!-- vim-markdown-toc -->

## Effective Shell Samples

**Shell and operating system context**

- Expect the shell and OS to be returned.

```bash
ai -- "what's my current shell and OS?"

chatgpt: Your current shell is /bin/bash and your operating system is linux.
```

**Simple script**

- Expect a terse response with a formatted bash script.

```bash
ai -- "show 5 largest files in pwd recursively"

chatgpt: To display the 5 largest files in the current directory recursively,
you can use the following command:

    find . -type f -exec du -h {} + | sort -rh | head -n 5
```

**Asking for code in chat**

- Expect code output only

```bash
ai -- "code output only - python to create a folder if it doesn't exist"

    import os

        folder_name = "example_folder"
        ...
```

**Execute generated script**

- Test each action, then execute action.
- Expect code only, single script.

```bash
ai -- "code: shell script for largest file in working directory, showing size"
chatgpt:
    
    #!/bin/bash
    ...
```

**Redirect responses to a file**

- Expect a valid shell script.

```bash
ai -- "code: shell script for largest file in working directory, showing size" > find.sh
```

## Basic Terminal AI

```bash
ai -- "Who are you and what are you for?"
```

## Interrogating Context

**Understanding Context**

- Expanded env vars and additional context vars should be shown
- When using the `--no-context` flag test the same as the above

```bash
ai -- "I wrote you a message starting with 'for context' can you tell me what you have read from this."
```

## Other tests

- `git diff | ai 'summarise'` should give colored output
- `git diff | ai 'add tests' > tests.ts` should create file
