>!WARNING
>
> This is a specification for proposed functionality and not yet implemented.

# Configuration Guide

Terminal AI is designed to be as simple as possible to use. When you start, if an OpenAI key is not detected it will ask you to provide one. However, you can use many [different providers](TODO).

This guide explains how the configuration system works, how to configure different providers, and the [full set of configuration options](TODO) which are available.

>!TIP
> You can use Terminal AI without paying for calls and without a credit card by signing up with Google Gemini. Instructions are at [Google Gemini](TODO). Once you have your key follow the steps at [OpenAI Compatible Providers](#TODO) or [Google Gemini - OpenAI](TODO)

There are three useful commands when working with configuration:

- **`ai init`** allows you to interactively set or update your configuration
- **`ai check`** tests your configuration, ensuring your API key, base URL and model is valid, and more
- **`ai config`** shows your configuration, including values which have been overridden - this can help with troubleshooting

<!-- vim-markdown-toc GFM -->

- [Configuration Essentials](#configuration-essentials)
    - [Configuring LLM Providers](#configuring-llm-providers)
        - [Basic Configuration Using OpenAI](#basic-configuration-using-openai)
        - [Basic Configuration Using OpenAI Compatible Providers such as Google Gemini](#basic-configuration-using-openai-compatible-providers-such-as-google-gemini)
        - [Advanced Provider Configuration](#advanced-provider-configuration)
        - [Using Non-OpenAI Compliant Providers](#using-non-openai-compliant-providers)
        - [Advanced: The Provider Selection Flow](#advanced-the-provider-selection-flow)
- [The Configuration Specification](#the-configuration-specification)
- [Reference Configuration](#reference-configuration)

<!-- vim-markdown-toc -->

## Configuration Essentials

Terminal AI is configured with a configuration file at `~/.ai/config.yaml`.

Almost all of the configuration settings can also be set by providing environment variables. 

### Configuring LLM Providers

The most essential configuration is how the LLM backend is specified.

#### Basic Configuration Using OpenAI

The only configuration that is required for Terminal AI to use OpenAI is an API key. This means your configuration file can be as minimal as this:

```yaml
apiKey: "openai key"
```

If this file is not found, or the API key is not present, Terminal AI will interactively initialise your configuration as if you had run `ai init`:

```
$ ai init

Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...
? OpenAI API Key [leave blank to keep existing]:
```

You can also provide the API key by setting `AI_API_KEY`:

```bash
AI_API_KEY="gemini key" ai -- 'bash cmd to zip local dir'
```

The default base URL is https://api.openai.com/v1/ - this can be changed by setting `baseURL` or `AI_BASE_URL`.

The default model is [`gpt-3.5-turbo`](TODO) - this can be changed by setting `model` or `AI_MODEL`.

#### Basic Configuration Using OpenAI Compatible Providers such as Google Gemini

Any provider that is compatible with the OpenAI API specification can be configured by providing its base URL. For example, you can use [Gemini](TODO) by setting your Gemini Key, the [OpenAI Compatible Base URL](TODO) and your preferred model:

```yaml
apiKey: "gemini key"
baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
model: "models/gemini-1.5-flash"
```

Again, if you don't want to create a configuration file (or want to override the values used), you use Environment Variables:

```bash
export AI_API_KEY="gemini key"
export AI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export AI_MODEL="models/gemini-1.5-flash"
git diff | ai chat -- 'summarise this diff' > summary.md
```

#### Advanced Provider Configuration

The `apiKey`, `baseURL` and `model` parameters are convenient for quickly setting up Terminal AI. However, you configure any number of providers. 

First set a `provider` name and a `providers` block:

```yaml
provider: gemeni
providers:
  gemini:
    apiKey: "gemini key"
    baseURL: "https://generativelanguage.googleapis.com/v1beta/"
    model: "TODO"
  deepseek:
    apiKey: "gemini key"
    baseURL: "https://generativelanguage.googleapis.com/v1beta/"
    model: "TODO"
    apiSpecification: "deepseek"
```

A provider must include an `apiKey`, `baseURL` and `model`. Providers are assumed to be compatible with the OpenAI API specification by default. If no `provider` (or `AI_PROVIDER`) is specified, Terminal AI will ask you to choose a provider on startup (or fail if run in non-interactive mode).

>!INFO
> When Terminal AI sees a `providers` block it assumes that you are using advanced provider configuration. This means the root level `apiKey`, `baseURL` and `model` parameters are ignored. Those fields are only for 'basic' configuration.

Providers must use OpenAI complaint API endpoints. For convenience, a list of providers which support the OpenAI specification are available in the [Reference Configuration](#TODO).

```
TODO
```

You can also use the [`ai-providers-and-models`](TODO) module to access a regularly updated list of providers and models - this module also shows OpenAI compatible endpoints which are offered.

#### Using Non-OpenAI Compliant Providers

>!TIP
> There is a feature (#X) in progress to support many more provider specifications, check back soon or [upvote](TODO) if you need this functionality!
 
If you need to use a provider that is not OpenAI Compatible, you can use the [XXX]() service to route requests:

```yaml
TODO
```

#### Advanced: The Provider Selection Flow

The way that provider configuration is selected is designed to make it very easy for new users to get started quickly, and advanced users to handle all of their use cases. This means the startup flow can be a little complex to reason about. The flow is detailed for reference below.

**If no `providers` block has been set**

- If no `apiKey` or `AI_API_KEY` is set, Terminal AI will ask for a key (or return an error if non-interactive).
- If no `baseURL` or `AI_BASE_URL` is configured, the base URL will be set to the default https://api.openai.com/v1/
- If no `model` or `AI_MODEL` is configured, the model will be set to the default [`gpt-3.5-turbo`](TODO)

**If a `providers` block as been set**

- The root level `apiKey`, `baseUrl`, `model` and their equivalent environment variables are ignored
- If no `provider` or `AI_PROVIDER` has been set, you will be offered the option to select a provider from the list you have configured in `providers`. If the app is running in non-interactive mode it will error.
- If a `provider` has been set, or `AI_PROVIDER` has been set, the provider with that name is chosen from the `providers` block. If that provider is not found, a warning will be shown and you will be offered the option to choose a provider. In non-interactive mode, the app will fail.

## The Configuration Specification

Each of the configuration values, the environment variables that can be used to update them, and their defaults are documented below.

| Config File                  | Env. Var       | Default                      | Description                                                                                             |
|------------------------------|----------------|------------------------------|---------------------------------------------------------------------------------------------------------|
| **Basic Provider Config**    |                |                              |                                                                                                         |
|------------------------------|----------------|------------------------------|---------------------------------------------------------------------------------------------------------|
| `apiKey`                     | `AI_API_KEY`  | (None).                      | Required if `providers` not set. OpenAI compatible API key.                                             |
| `baseURL`                    | `AI_BASE_URL` | `https://api.openai.com/v1/` | The base URL for API calls.                                                                             |
| `model`                      | `AI_MODEL`    | `gpt-3.5-turbo`              | The LLM model ID to use.                                                                                |
|------------------------------|----------------|------------------------------|---------------------------------------------------------------------------------------------------------|
| **Advanced Provider Config** |                |                              | If `providers` is set, all 'basic' config above is ignored.                                             |
|------------------------------|----------------|------------------------------|---------------------------------------------------------------------------------------------------------|
| `provider`                   | `AI_PROVIDER` | (None).                      | The name of the provider in `providers` to use. If not set, `ai` will ask (or fail if non-interactive). |
| `providers`                  |                | (None).                      | The set of providers that are configured.                                                               |
| `providers.[name]`           |                | (None).                      | The name of the provider (`provider` should set one of these names).                                    |
| `providers.[name].apiKey`    |                | (None).                      | The API key for the provider.                                                                           |
| `providers.[name].baseURL`   |                | (None).                      | The OpenAI compatible base URL for the provider APIs.                                                   |
| `providers.[name].model`     |                | (None).                      | The model for the provider.                                                                             |
TODO: debug

## Reference Configuration

The reference configuration below can be used to quickly see how different configuration options can be set:

```yaml
# Note that these values are ignored as 'providers' has been set...
apiKey: <openai key>
baseURL: https://api.openai.com/v1/
model: gpt-3.5-turbo

# The 'gemini2.5 provider is the default provider used.
provider: gemini2.5
# Each provider is defined below.
providers:
  gemini2.5:
    apiKey: <secret>
    baseURL: https://generativelanguage.googleapis.com/v1beta/openai/
    model: models/gemini-2.5-flash
```
