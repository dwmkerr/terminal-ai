import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { selectModel } from "../commands/init/select-model";
import { saveModel } from "../configuration/configuration";

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
    //  Choose the model.
    const model = await selectModel(params.config.openai.model);
    if (model !== undefined) {
      //  This is really naughty as we're changing the state of an input
      //  unexpectedly but it works for now...
      params.config.openai.model = model;
      saveModel(model);
    }

    return undefined;
  },
};
