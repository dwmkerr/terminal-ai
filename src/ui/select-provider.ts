import { select } from "@inquirer/prompts";
import { ProviderConfiguration } from "../configuration/configuration";

/**
 * Interface for the selectProvider function parameters
 */
export interface SelectProviderParams {
  /**
   * The message to display in the selection prompt
   */
  message?: string;
  /**
   * The currently selected provider
   */
  currentProvider: ProviderConfiguration;
  /**
   * All available providers
   */
  availableProviders: ProviderConfiguration[];
  /**
   * The name of the default provider to select in the list
   * If not specified, no default is selected
   */
  default?: string;
}

/**
 * selectProvider - presents a simple selection menu for available providers.
 *
 * This is an example of the UI component pattern:
 * 1. UI components should be in the 'ui' directory
 * 2. They should be focused on a single interaction
 * 3. They should return typed data
 * 4. They should not modify state directly
 * 5. They should be documented with JSDoc
 *
 * @param {SelectProviderParams} params - configuration for the provider selection
 * @returns {Promise<ProviderConfiguration | null>} the selected provider or null if cancelled
 */
export async function selectProvider({
  message = "Select Provider:",
  currentProvider,
  availableProviders,
  default: defaultProviderName,
}: SelectProviderParams): Promise<ProviderConfiguration | null> {
  const choices = availableProviders.map((provider) => ({
    name:
      provider.name === currentProvider.name
        ? `${provider.name} (current)`
        : provider.name,
    value: provider,
  }));

  // Find the default choice based on the provider name
  const defaultValue = defaultProviderName
    ? choices.find(
        (choice) =>
          (choice.value as ProviderConfiguration).name === defaultProviderName,
      )?.value
    : undefined;

  const selected = await select({
    message,
    choices,
    default: defaultValue,
  });

  return selected;
}
