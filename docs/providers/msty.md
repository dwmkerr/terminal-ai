# msty

Terminal AI works out of the box with Msty.

To get started, first install: https://msty.app/

Once Msty is installed and running, you'll have access to various models through its local API server. Msty will automatically start an API server on port 10000 by default.

Run Msty and configure a model. As an example we'll use Ollama as a local provider.

Then run `ai init` to configure your provider, using the following details:

- Provider Type: OpenAI Compatible
- API Key: `notused` (by default, Msty doesn't need a key, but Terminal AI requires one to be configured)
- Base URL: `http://localhost:10000/v1/`
- Model: Choose from one of your available models (e.g. `gemma3:1b` or `llama3.2:latest`)

Choose 'yes' for 'Set as current provider' and 'Test API Key & Configuration'. You will see output similar to the below:

```
✔ Set as current provider? Yes
✔ Test API Key & Configuration? Yes
✔ Checking internet connection...
✔ Checking Base URL http://localhost:10000/v1/...
✔ Checking API key...
✔ Checking Model gemma3:1b...
✔ Checking API key rate limit...
```

At this point you will be able to chat using your local Msty installation:

```
✔ chat: hi msty
msty: Hello! How can I assist you today?
```

You can also manually add the Msty provider details to your [Configuration File](../configuration.md):

```yaml
provider: msty
providers:
  msty:
    name: msty
    type: openai_compatible
    baseURL: http://localhost:10000/v1/
    model: gemma3:1b
    apiKey: notused
```

If you're using Msty with a remote provider (like Cohere), make sure that model is properly configured in your Msty app before attempting to use it with Terminal AI.
