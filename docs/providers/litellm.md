# litellm

[LiteLLM](https://www.litellm.ai/) can be used to proxy requests to many different inference providers.

LiteLLM exposes providers using the [OpenAI API specification](https://docs.litellm.ai/docs/#call-100-llms-using-the-openai-inputoutput-format). This means that it can be used to proxy Terminal AI requests from OpenAI format to non-OpenAI compatible providers.

As an example, we will configure LiteLLM to proxy OpenAI SDK requests to Anthropic Claude. Note that as Claude has an [OpenAI compatible endpoint](https://docs.anthropic.com/en/api/openai-sdk) you could simply configure Terminal AI to use this (see the [Configuration Guide](../configuration.md)), however this example shows how LiteLLM can translate requests to Claudes own API format.

Create a [LiteLLM configuration file](https://docs.litellm.ai/docs/proxy/configs) with Claude 3.7 configured as a model:

```bash
cat << EOF > litellm_config.yaml
model_list:
  - model_name: claude-3.7
    litellm_params:
      model: claude-3-7-sonnet-20250219
      api_key: "os.environ/ANTHROPIC_API_KEY"
EOF
```

Set your Anthropic API key. You could also provide an API base URL if you would like to call a custom endpoint (such as an internal AI API gateway):

```bash
ANTHROPIC_API_KEY="***"
ANTHROPIC_API_BASE="https://api.anthropic.com/v1"
```

Now run the proxy container:

```bash
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e ANTHROPIC_API_KEY \
    -e ANTHROPIC_API_BASE \
    -p 4000:4000 \
    ghcr.io/berriai/litellm:main-latest \
    --config /app/config.yaml --detailed_debug
```

Run a completion to confirm that your configuration is correct:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
      "model": "claude-3.7",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }'
# example output:
# {
#   "model":"claude-3-7-sonnet-20250219",
#   "message":{
#     "content":"I am Claude, an AI assistant created by Anthropic...",
#     "role":"assistant"
#     ...
```

Now run `ai init` to configure your provider, using the following details:

- Provider Type: OpenAI Compatible
- API Key: `notused` (LiteLLM has required keys loaded into its proxy)
- Base URL: `http://localhost:4000/`
- Model: `claude-3.7`
- Provider name: `litellm`

Choose 'yes' for 'Set as current provider' and 'Test API Key & Configuration'. You will see output similar to the below:

```
✔ Set as current provider? Yes
✔ Test API Key & Configuration? Yes
✔ Checking internet connection...
✔ Checking Base URL http://localhost:4000/...
✔ Checking API key...
✔ Checking Model claude-3.7...
✔ Checking API key rate limit...
```

At this point you will be able to interface with inference providers via the LiteLLM proxy:

```
✔ chat: bash one liner for a rainbow
claude:

    for i in {1..7}; do echo -e "\033[3${i}mRainbow\033[0m"; done

Run this to see a simple rainbow text effect in your terminal.
```

You can also manually add the LiteLLM provider details to your [Configuration File](../configuration.md):

```yaml
provider: litellm # set the current provider
providers:
  litellm:
    name: litellm
    type: openai_compatible
    baseURL: http://localhost:4000/
    model: claude-3.7
    apiKey: notused
```
