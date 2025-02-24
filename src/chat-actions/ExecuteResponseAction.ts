import { confirm, editor } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { TerminatingError } from "../lib/errors";
import { execCommand } from "../lib/cli-helpers";

export const ExecuteResponseAction: ChatAction = {
  id: "execute_response",
  displayNameInitial: "Execute Response",
  displayNameReply: "Execute Response",
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
        `a response must be provided to the 'execute' action`,
      );
    }
    const code = await editor({
      message: "Verify your script - AI can make mistakes!",
      default: response.codeBlocks[0]?.plainTextCode,
      postfix: "sh",
    });
    const validate = await confirm({
      message: "Are you sure you want to execute this code?",
      default: false,
    });
    if (validate) {
      await execCommand(code, true);
    }

    return undefined;
  },
};
