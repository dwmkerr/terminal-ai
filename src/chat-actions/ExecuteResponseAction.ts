import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { confirm, editor } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { ChatAction } from "./ChatAction";
import { execCommand } from "../lib/cli-helpers";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export const ExecuteResponseAction: ChatAction = {
  id: "execute_response",
  displayNameInitial: "Execute Response",
  displayNameReply: "Execute Response",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async (
    _: ChatPipelineParameters,
    __: ChatCompletionMessageParam[],
    response?: ChatResponse,
  ): Promise<string | undefined> => {
    if (response === undefined) {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
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
