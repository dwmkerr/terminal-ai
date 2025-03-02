import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { TerminatingError } from "../lib/errors";
import { writeClipboard } from "../lib/clipboard";

export const CopyResponseAction: ChatAction = {
  id: "copy_response",
  displayNameInitial: "Copy Response",
  displayNameReply: "Copy Response",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async (
    _: ChatPipelineParameters,
    __: OpenAIMessage[],
    response?: ChatResponse,
  ): Promise<string | undefined> => {
    if (response === undefined) {
      throw new TerminatingError(
        `a response must be provided to the 'copy' action`,
      );
    }
    await writeClipboard(response.plainTextFormattedResponse, true);

    return undefined;
  },
};
