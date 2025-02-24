import fs from "fs";
import { input } from "@inquirer/prompts";
import theme from "../theme";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { OpenAIMessage } from "../lib/openai/openai-message";
import { ChatAction } from "./ChatAction";
import { TerminatingError } from "../lib/errors";

export const DumpConversationAction: ChatAction = {
  id: "dump",
  displayNameInitial: "Save Conversation",
  displayNameReply: "Save Conversation",
  isInitialInteractionAction: false,
  isDebugAction: true,
  weight: 0,
  execute: async (
    _: ChatPipelineParameters,
    messages: OpenAIMessage[],
  ): Promise<string | undefined> => {
    const inputPrompt = theme.inputPrompt("Save As");
    const path = await input({ message: inputPrompt });
    try {
      const content = messages
        .map((m) => `**${m.role}**\n${m.content}`)
        .join("\n");
      fs.writeFileSync(path, content, "utf8");
      console.log(`✅ Conversation history saved to ${path}!`);
    } catch (err) {
      throw new TerminatingError(
        "Error saving response - you might be overwriting a file or saving in a folder that doesn't exist?",
      );
    }

    return undefined;
  },
};
