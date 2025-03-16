import { input } from "@inquirer/prompts";
import theme, { deleteLinesAboveCursor } from "../theme";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { saveAs } from "../lib/save-as";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export const SaveConversationAction: ChatAction = {
  id: "save_conversation",
  displayNameInitial: "Save Conversation",
  displayNameReply: "Save Conversation",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 0,
  execute: async (
    _: ChatPipelineParameters,
    messages: OpenAIMessage[],
  ): Promise<string | undefined> => {
    //  Get the path. If nothing is provided, try again.
    let path = await input({ message: theme.inputPrompt("Save As") });
    while (!path) {
      deleteLinesAboveCursor(1);
      path = await input({ message: theme.inputPrompt("Save As") });
    }

    //  Try and save. If overwriting and the user says 'no' then keep asking for
    //  paths.
    try {
      const content = messages
        .filter((m) => m.role !== "system")
        .map((m) => `**${m.role}**\n${m.content}`)
        .join("\n");
      if (await saveAs(path, content, true)) {
        console.log(`✅ Conversation history saved to ${path}!`);
      }
    } catch (err) {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        `saving conversation error: ${err}`,
        err as Error,
      );
    }

    return undefined;
  },
};
