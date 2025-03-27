import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { ErrorCode, TerminalAIError } from "../lib/errors";
import { selectModel } from "../commands/init/select/select-model";

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
    const config = params.executionContext.config;
    const model = await selectModel(config.model);
    if (model !== undefined) {
      //  This is really naughty as we're changing the state of an input
      //  unexpectedly but it works for now...
      config.model = model;
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        "No longer supported",
      );
      // saveModel(model);
    }

    return undefined;
  },
};
