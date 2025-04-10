import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { selectModel } from "../commands/init/select/select-model";
import { updateConfigurationFile } from "../configuration/update-configuration-file";
import { selectProvider } from "../ui/select-provider";

export const ChangeModelAction: ChatAction = {
  id: "change_model",
  displayNameInitial: "Change Provider/Model",
  displayNameReply: "Change Provider/Model",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 0,
  execute: async (
    params: ChatPipelineParameters,
  ): Promise<string | undefined> => {
    const executionContext = params.executionContext;
    let provider = params.executionContext.provider;

    //  First check if we have multiple providers
    const providers = Object.values(executionContext.config.providers);
    if (providers.length > 1) {
      //  Allow selecting a provider first
      const selectedProvider = await selectProvider({
        message: "Select Provider:",
        currentProvider: provider,
        availableProviders: providers,
        default: provider.name,
      });

      //  If user selected a different provider, update it
      if (selectedProvider && selectedProvider.name !== provider.name) {
        provider = selectedProvider;
        //  Update the execution context with the new provider
        executionContext.provider = provider;
        //  Update the configuration file
        updateConfigurationFile(executionContext.configFilePath, {
          provider: provider.name,
        });
      }
    }

    //  Now choose the model for the selected provider
    const model = await selectModel(provider.model, provider.type);
    provider.model = model;

    //  Save the model. It's either a named provider or the root provider.
    if (provider.name !== "") {
      updateConfigurationFile(executionContext.configFilePath, {
        [`providers.${provider.name}.model`]: model,
      });
    } else {
      updateConfigurationFile(executionContext.configFilePath, {
        [`model`]: model,
      });
    }

    return undefined;
  },
};
