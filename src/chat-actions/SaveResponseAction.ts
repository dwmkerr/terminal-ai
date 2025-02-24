import fs from "fs";
import { input } from "@inquirer/prompts";
import theme from "../theme";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { TerminatingError } from "../lib/errors";

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
      throw new TerminatingError(
        `a response must be provided to the 'save' action`,
      );
    }
    const inputPrompt = theme.inputPrompt("Save As");
    const path = await input({ message: inputPrompt });
    try {
      fs.writeFileSync(path, response.plainTextFormattedResponse, "utf8");
      console.log(`✅ Response saved to ${path}!`);
    } catch (err) {
      throw new TerminatingError(
        "Error saving response - you might be overwriting a file or saving in a folder that doesn't exist?",
      );
    }

    return undefined;
  },
};
