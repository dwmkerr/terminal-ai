import { input } from "@inquirer/prompts";
import { ProviderConfiguration } from "../../../configuration/configuration";
import { selectProviderType } from "./select-provider-type";
import { inputApiKey } from "./input-api-key";
import { createProviderConfig } from "../../../providers/create-provider-config";
import { selectModel } from "./select-model";

/**
 * addOrEditProvider - interactively add or edit a provider.
 *
 * @param {ProviderConfiguration} provider - the provider to edit. If undefined
 * we are adding a new provider.
 */
export async function addOrEditProvider(provider?: ProviderConfiguration) {
  //  Choose the provider type.
  const providerType = await selectProviderType(provider?.type || "openai");

  //  Pick the API key.
  const apiKey = await inputApiKey(provider?.apiKey);

  //  The provider we've chosen might have a base url. We use the editing
  //  provider's base url if it exists, and the default from the provider
  //  type otherwise.
  const { baseURL: defaultBaseURL } = createProviderConfig(providerType, "");
  const baseURL = await input({
    message: "Base URL:",
    default: provider?.baseURL || defaultBaseURL,
    validate: (url) => (url === "" ? "Base URL is required" : true),
  });

  //  Pick the model.
  const model = await selectModel(provider?.model, providerType);

  //  If we are creating a new provider config, we need a name.
  let name = provider?.name;
  if (!name) {
    name = await input({
      message: "Provider Name:",
      validate: (name) => (name === "" ? "Name is required" : true),
    });
  }

  //  Return this new or edited provider.
  const newProvider: ProviderConfiguration = {
    name,
    type: providerType,
    baseURL,
    model,
    apiKey,
  };
  return newProvider;
}
