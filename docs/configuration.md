# Configuration

Terminal AI is designed to be as simple as possible to use. When you start, if an API key is not provided it will ask you to configure one. You can configure your providers at any time with the `ai init` command.

> [!TIP]
> You can use Terminal AI without paying for API calls and without a credit card by signing up with Google Gemini. Instructions are in the [API Key Documentation](https://github.com/dwmkerr/terminal-ai#api-key). Once you have your key just run `ai init`.

This guide explains how the configuration system works, how to configure different providers, and the [full set of configuration options](#the-configuration-specification) which are available.

<!-- vim-markdown-toc GFM -->

- [Configuration Essentials](#configuration-essentials)
    - [Basic LLM Configuration](#basic-llm-configuration)
    - [Advanced LLM Configuration](#advanced-llm-configuration)
- [Validating Configuration](#validating-configuration)
- [Viewing Configuration](#viewing-configuration)
- [The Configuration Specification](#the-configuration-specification)
- [Reference Configuration](#reference-configuration)

<!-- vim-markdown-toc -->

## Configuration Essentials

Terminal AI is configured with a configuration file at `~/.ai/config.yaml`.

Almost all of the configuration settings can also be set by providing environment variables. 

There are three useful commands when working with configuration:

- **`ai init`** allows you to interactively set or update your configuration
- **`ai check`** tests your configuration, ensuring your API key, base URL and model is valid, and more
- **`ai config`** shows your configuration, including values which have been overridden - this can help with troubleshooting

### Basic LLM Configuration

The most essential configuration is for the LLM provider.

**Basic Configuration Using OpenAI**

The only configuration that is required for Terminal AI to use OpenAI is an API key. This means your configuration file can be as minimal as this:

```yaml
apiKey: "openai key"
```

If this file is not found, or the API key is not present, Terminal AI will interactively initialise your configuration as if you had run `ai init`:

```
$ ai init

Welcome to Terminal AI

An OpenAI or compatible key is required.
To get a free key follow the guide at:
  https://github.com/dwmkerr/terminal-ai#api-key

✔ Your API key provider: Gemini (OpenAI Compatible)
✔ API Key: ******
```

You can also provide the API key by setting `AI_API_KEY`:

```bash
AI_API_KEY="gemini key" ai -- 'bash cmd to zip local dir'
```

The default base URL is https://api.openai.com/v1/ - this can be changed by setting `baseURL` or `AI_BASE_URL`.

The default model is `gpt-3.5-turbo` - this can be changed by setting `model` or `AI_MODEL`.

**Configuration Using Google Gemini**

A small number of providers are pre-configured out of the box. [Google Gemini](https://gemini.google.com/) is one of them - simply run `ai init` and choose "Gemini (OpenAI Compatible)" as the provider. An appropriate base URL and model will be offered as defaults.

**Configuration Using OpenAI Compatible Providers**

Any provider that is OpenAI API compatible can be configured by providing its base URL.

For example, you can use [Anthropic Claude](https://claude.ai/) by setting your Anthropic API Key, its base URL and your preferred model:

```
$ ai init

Welcome to Terminal AI

✔ Configure Provider (key, model, etc)? Yes
✔ Update / Add Provider: Add Provider
✔ Provider Type: OpenAI Compatible
✔ API Key: **********
✔ Base URL: https://api.anthropic.com/v1
✔ Select model: claude-3-opus-20240229
✔ Provider Name: claude
```

All providers can have their configuration validated with [`ai check`](#validating-configuration).

Again, if you don't want to create a configuration file (or want to override the values used), you can use environment Variables:

```bash
# Configure your provider...
export AI_API_KEY="anthropic-key"
export AI_BASE_URL="https://api.anthropic.com/v1"
export AI_MODEL="claude-3-opus-20240229"

# ...then run ai:
git diff | ai chat -- 'summarise this diff' > summary.md
```

### Advanced LLM Configuration

The `apiKey`, `baseURL` and `model` parameters are convenient for quickly setting up Terminal AI. However, you configure any number of providers by using a `provider` field and `providers` block in the `~/.ai/config.yaml` file:

```yaml
provider: gemini
providers:
  gemini:
    baseURL: https://generativelanguage.googleapis.com/v1beta/openai/
    model: models/gemini-2.0-flash
    apiKey: gemini-key
    type: gemini_openai
  claude:
    baseURL: https://api.anthropic.com/v1
    model: claude-3-opus-20240229
    apiKey: anthropic-key
    type: openai_compatible
```

A provider must include an `apiKey`, `baseURL` and `model`. Providers are assumed to be compatible with the OpenAI API specification by default.

If you specify a `type` then Terminal AI will use the database at [`ai-providers-and-models`](https://github.com/dwmkerr/ai-providers-and-models) to offer more helpful information when setting models and validating configuration.

There many other configuration options you can set for providers, check [the Configuration Specification](#the-configuration-specification) for details.

## Validating Configuration

Run `ai check` to validate your configuration:

```
$ ai check

✔ Checking internet connection...
✔ Checking Base URL https://generativelanguage.googleapis.com/v1beta/openai/...
✔ Checking API key...
✔ Checking Model models/gemini-2.0-flash...
✔ Checking API key rate limit...
...
```

The `ai check` command will make a best-effort attempt to validate that the model is correct by checking whether the `models` API can be called.

It also checks the model ID against the database at [`ai-providers-and-models`](https://github.com/dwmkerr/ai-providers-and-models).

## Viewing Configuration

To see the fully loaded configuration run `ai config`. This will show everything that has been loaded from the configuration file, environment variables, prompt files and so on.

## The Configuration Specification

Each of the configuration values, the environment variables that can be used to update them, and their defaults are documented below.

| Config File                   | Env. Var             | Default                      | Description                                                                                                     |
|-------------------------------|----------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **Basic Provider Config**     |                      |                              |                                                                                                                 |
| `apiKey`                      | `AI_API_KEY`         | (None).                      | Required if `providers` not set. OpenAI compatible API key.                                                     |
| `baseURL`                     | `AI_BASE_URL`        | `https://api.openai.com/v1/` | (Optional). The base URL for API calls.                                                                         |
| `model`                       | `AI_MODEL`           | `gpt-3.5-turbo`              | (Optional). The LLM model ID to use.                                                                            |
| **Advanced Provider Config**  |                      |                              | If `providers` is set, all 'basic' config above is ignored.                                                     |
| `provider`                    | `AI_PROVIDER`        | (None).                      | The name of the provider in `providers` to use. If not set, `ai` will ask (or fail if non-interactive).         |
| `providers`                   |                      | (None).                      | The set of providers that are configured.                                                                       |
| `providers.[name]`            |                      | (None).                      | The name of the provider (`provider` should set one of these names).                                            |
| `providers.[name].apiKey`     |                      | (None).                      | The API key for the provider.                                                                                   |
| `providers.[name].baseURL`    |                      | (None).                      | The OpenAI compatible base URL for the provider APIs.                                                           |
| `providers.[name].model`      |                      | (None).                      | The model for the provider.                                                                                     |
| `providers.[name].providerId` |                      | (None).                      | (Optional). A provider id from [`ai-providers-and-models`](https://github.com/dwmkerr/ai-providers-and-models). |
| `providers.[name].prompt`     |                      | (None).                      | (Optional). The text to show as a prompt before provider chat output. Defaults to the provider name.            |
| **Debug Configuration**       |                      |                              |                                                                                                                 |
| `debug.enabled`               | `AI_DEBUG_ENABLE`    | `0`                          | (Optional). Whether to enable debug mode.                                                                       |
| `debug.namespace`             | `AI_DEBUG_NAMESPACE` | `ai*`                        | (Optional). Mask for debug messages.                                                                            |

## Reference Configuration

The reference configuration below can be used to quickly see how different providers and configuration options can be set:

```yaml
# Note that these values are ignored if 'provider' below has been set...
apiKey: <openai key>
baseURL: https://api.openai.com/v1/
model: gpt-3.5-turbo

# Choose which provider to use from the 'providers' block.
provider: openai

# Each provider is defined below.
providers:
  openai:
    name: openai
    type: openai
    baseURL: https://api.openai.com/v1/
    model: gpt-4-0613
    apiKey: '123'
  gemini:
    name: gemini
    type: gemini_openai
    baseURL: https://generativelanguage.googleapis.com/v1beta/openai/
    model: models/gemini-2.0-flash
    apiKey: '123'
  claude:
    name: claude
    type: openai_compatible
    baseURL: https://api.anthropic.com/v1
    model: claude-3-opus-20240229
    apiKey: '123'
```
