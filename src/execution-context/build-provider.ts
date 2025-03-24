import {
  Configuration,
  ProviderConfiguration,
} from "../configuration/configuration";

export function buildProviderFromConfig(
  config: Configuration,
): ProviderConfiguration {
  //  Initially, we simply return a provider based on the root config fields.
  return {
    providerId: undefined,
    name: "",
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
  };
}
