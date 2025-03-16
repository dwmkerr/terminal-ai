import { input } from "@inquirer/prompts";
import theme, { deleteLinesAboveCursor } from "../theme";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { saveAs } from "../lib/save-as";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export const SaveResponseAction: ChatAction = {
  id: "save_response",
  displayNameInitial: "Save Response",
  displayNameReply: "Save Response",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async (
    _: ChatPipelineParameters,
    __: OpenAIMessage[],
    response?: ChatResponse,
  ): Promise<string | undefined> => {
    if (response === undefined) {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        "response is missing in 'save response'",
      );
    }

    //  Get the path. If nothing is provided, try again.
    let path = await input({ message: theme.inputPrompt("Save As") });
    while (!path) {
      deleteLinesAboveCursor(1);
      path = await input({ message: theme.inputPrompt("Save As") });
    }

    //  Try and save. If overwriting and the user says 'no' then keep asking for
    //  paths.
    try {
      if (await saveAs(path, response.plainTextFormattedResponse, true)) {
        console.log(`✅ Response saved to ${path}!`);
      }
    } catch (err) {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        `error saving response: ${err}`,
        err as Error,
      );
    }

    return undefined;
  },
};
