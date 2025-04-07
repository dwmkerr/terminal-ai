# Experimental Features

These experimental features are subject to change, less tested and may not work as expected. They are available for preview and experimentation only. If enough users find an experimental feature useful it may be moved into a more stable form at some point.

## Assistants API

You can try using the [Assistants APIs](https://platform.openai.com/docs/assistants/overview) rather than the [Completions APIs](https://platform.openai.com/docs/guides/completions) with the `--assistant` flag:

```bash
ai --assistant -- "Who are you?"
```

Note that responses will be considerably slower and more API calls will be made.

The Assistants API will likely not be supported beyond simple experimentation - the Responses and Agents APIs are more suitable for advanced use cases, and the Completions API more suitable for simple use cases.

Known issues:

- System messages are not handled properly, they are instead provided as `user` messages. A more robust solution is probably to pass them as `additional_instructions`, see [OpenAI: Role for adding messages to instruct - Assistant API](https://community.openai.com/t/role-for-adding-messages-to-instruct-assistant-api/729082).
- It seems that context messages may be being duplicated, to verify this have a conversation then ask `summarise each message we've exchanged so far, maximum one line per message` - duplicates for context will have been added
- Image files are not supported. The Completions API allows for base64 encoded image content, the Assistants API requires that a file object must be uploaded. This is possible with a small number of changes, but the assistants API is not likely to be a commonly used feature.
