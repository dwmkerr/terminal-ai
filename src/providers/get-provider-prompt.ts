import { ProviderConfiguration } from "../configuration/configuration";

export function getProviderPrompt(provider: ProviderConfiguration): string {
  //  The root provider is 'ChatGPT' i.e. a friendly prompt for newcomers
  //  who have just init-ed, otherwise we use the provider name (which later
  //  will be the provider prompt, user specified in config and name otherwise).
  return provider.name === "" ? "chatgpt" : provider.name;
}
