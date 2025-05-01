# ollama

Terminal AI works out of the box with Ollama.

To get started, first install Ollama: https://ollama.com/download

Now install a model, such as `gemma3`:

```bash
ollama run gemma3:1b 
```

Then run `ai init` to configure your provider, using the following details:

- Provider Type: OpenAI Compatible
- API Key: `notused` (by default, Ollama doesn't need a key, but Terminal AI requires one to be configured)
- Base URL: `http://localhost:11434/v1`
- Model: `gemma3:1b`

Choose 'yes' for 'Set as current provider' and 'Test API Key & Configuration'. You will see output similar to the below:

```
✔ Set as current provider? Yes
✔ Test API Key & Configuration? Yes
✔ Checking internet connection...
✔ Checking Base URL http://localhost:11434/v1...
✔ Checking API key...
✔ Checking Model gemma3:1b...
✔ Checking API key rate limit...
```

At this point you will be able to chat using your local Ollama installation:

```
✔ chat: hi ollama
ollama: hi!
```

You can also manually add the Ollama provider details to your [Configuration File](../configuration.md):

```yaml
provider: ollama
providers:
  ollama:
    name: ollama
    type: openai_compatible
    baseURL: http://localhost:11434/v1
    model: gemma3:1b
    apiKey: notused
```
