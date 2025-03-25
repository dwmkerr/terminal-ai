import {
  Configuration,
  ProviderConfiguration,
} from "../configuration/configuration";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export function buildProviderFromConfig(
  config: Configuration,
): ProviderConfiguration {
  //  If we have a provider name, then we can look it up from the providers
  //  block.
  const providerName = config.provider;
  if (providerName) {
    //  If there is no provider with the given name, this is a configuration
    //  error and we cannot continue.
    const provider = config.providers[providerName];
    if (!provider) {
      throw new TerminalAIError(
        ErrorCode.InvalidConfiguration,
        `provider with name '${providerName}' not found in configured 'providers' block`,
      );
    }
    return provider;
  }

  //  Initially, we simply return a provider based on the root config fields.
  return {
    name: "",
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
  };
}
