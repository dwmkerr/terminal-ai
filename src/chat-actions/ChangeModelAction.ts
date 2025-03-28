import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { selectModel } from "../commands/init/select/select-model";
import { updateConfigurationFile } from "../configuration/update-configuration-file";

export const ChangeModelAction: ChatAction = {
  id: "change_model",
  displayNameInitial: "Change Model",
  displayNameReply: "Change Model",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 0,
  execute: async (
    params: ChatPipelineParameters,
  ): Promise<string | undefined> => {
    //  Choose the model, update the context.
    const executionContext = params.executionContext;
    const provider = params.executionContext.provider;
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
