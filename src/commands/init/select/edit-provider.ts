import { input } from "@inquirer/prompts";
import { ProviderConfiguration } from "../../../configuration/configuration";
import { selectProviderType } from "./select-provider-type";
import { inputApiKey } from "./input-api-key";
import { createProviderConfig } from "../../../providers/create-provider-config";

export async function editProvider(provider?: ProviderConfiguration) {
  //  Choose the provider type.
  const providerType = await selectProviderType(provider?.type || "openai");

  //  Based on the provider type, we might have a good default base url.
  const { baseURL: defaultBaseURL } = createProviderConfig(providerType, "");
  const baseUrl = await input({
    message: "Base URL:",
    default: provider?.baseURL || defaultBaseURL,
    validate: (url) => (url === "" ? "Base URL is required" : true),
  });

  //  TODO model select
  const model = await input({
    message: "Model:",
    default: provider?.model,
    validate: (url) => (url === "" ? "Model is required" : true),
  });
  const apiKey = await inputApiKey(provider?.apiKey);

  //  If we are creating a new provider config, we need a name.
  let name = provider?.name;
  if (!name) {
    name = await input({
      message: "Provider Name:",
      validate: (name) => (name === "" ? "Name is required" : true),
    });
  }

  //  Now save all this back.
  //  If true, our current provider is the config root provider (i.e. the very
  //  basic unnamed provider).
  // const isRoot = provider.name === "";
  // updateConfigurationFile("testing", {
  console.log("testing", {
    name,
    providerType,
    baseUrl,
    model,
    apiKey,
  });

  // //  Create the provider configuration from the settings we've chosen.
  // const provider = createProviderConfig(providerId, apiKey);

  // //  Update our execution config with the provider, and update the config file.
  // executionContext.provider = provider;
  // updateConfigurationFile(executionContext.configFilePath, {
  //   [`provider`]: provider.name,
  //   [`providers.${provider.name}`]: provider,
  // });
}
