import { ExecutionContext } from "../../execution-context/execution-context";
import { updateConfigurationFile } from "../../configuration/update-configuration-file";
import { selectProviderType } from "./select/select-provider-type";
import { inputApiKey } from "./select/input-api-key";
import { createProviderConfig } from "../../providers/create-provider-config";

export async function initSetProviderApiKey(
  executionContext: ExecutionContext,
) {
  //  Ask for a provider.
  const providerType = await selectProviderType(
    "openai",
    "Your API key provider:",
  );

  //  Ask for an API key.
  const apiKey = await inputApiKey();

  //  Create the provider configuration from the settings we've chosen.
  const provider = createProviderConfig(providerType, apiKey);

  //  Update our execution config with the provider, and update the config file.
  executionContext.provider = provider;
  updateConfigurationFile(executionContext.configFilePath, {
    [`provider`]: provider.name,
    [`providers.${provider.name}`]: provider,
  });
}
