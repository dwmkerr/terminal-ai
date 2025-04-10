import { ExecutionContext } from "../execution-context/execution-context";
import { ProviderConfiguration } from "./configuration";
import { updateConfigurationFile } from "./update-configuration-file";

/**
 * updateCurrentProvider - updates the current provider in the config file.
 *
 * @param {ExecutionContext} executionContext - the execution context
 * @param {ProviderConfiguration} provider - the provider to set as current
 */
export function updateCurrentProvider(
  executionContext: ExecutionContext,
  provider: ProviderConfiguration,
): void {
  // Update the provider in the execution context
  executionContext.provider = provider;

  // Update the provider name in the config file
  updateConfigurationFile(executionContext.configFilePath, {
    provider: provider.name,
  });
}
