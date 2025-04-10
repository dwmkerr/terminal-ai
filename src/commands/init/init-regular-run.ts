import { confirm, select } from "@inquirer/prompts";
import { inputPrompt } from "../../theme";
import { ExecutionContext } from "../../execution-context/execution-context";
import { Commands } from "../commands";
import { check } from "../../commands/check/check";
import { initUpdateProviders } from "./init-update-providers";
import { selectProvider } from "../../ui/select-provider";
import { updateConfigurationFile } from "../../configuration/update-configuration-file";

export async function initRegularRun(
  executionContext: ExecutionContext,
  enableUpdateProvider: boolean,
  askNextAction: boolean,
): Promise<Commands> {
  //  If we have multiple providers, directly show the provider selection
  const providers = Object.values(executionContext.config.providers);
  if (providers.length > 1) {
    // Use the enhanced selectProvider with params object, passing current provider name as default
    const selectedProvider = await selectProvider({
      message: "Current Provider:",
      currentProvider: executionContext.provider,
      availableProviders: providers,
      default: executionContext.provider.name,
    });

    // Only update if the selected provider is different from current
    if (
      selectedProvider &&
      selectedProvider.name !== executionContext.provider.name
    ) {
      // Update the current provider directly in the execution context
      executionContext.provider = selectedProvider;
      // Update the configuration file
      updateConfigurationFile(executionContext.configFilePath, {
        provider: selectedProvider.name,
      });
    }
  }

  //  If we are going to let the user update their provider, do so now.
  //  The only reason we don't do this is if this function is coming
  //  directly after the first-run init.
  if (enableUpdateProvider) {
    //  Offer advanced options.
    const updateProvider = await confirm({
      message: "Reconfigure (key/model/etc) or add new Provider?",
      default: false,
    });
    if (updateProvider) {
      await initUpdateProviders(executionContext);
    }
  }

  //  Offer to validate.
  const validate = await confirm({
    message: "Test API Key & Configuration?",
    default: false,
  });
  if (validate) {
    await check(executionContext);
  }

  //  Ask for the next action if we have chosen this option.
  if (!askNextAction) {
    return Commands.Unknown;
  }
  const answer = await select({
    message: inputPrompt("What next?"),
    default: "chat",
    choices: [
      {
        name: "Chat",
        value: "chat",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  });
  if (answer === "chat") {
    return Commands.Chat;
  }

  return Commands.Quit;
}
