import OpenAI from "openai";
import { FileInput } from "../input/file-input/file-input";

export type ChatContext = {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  filePathsOutbox: string[];
  filePathsSent: string[];
  filesSent: FileInput[];
};

export function initialChatContext(): ChatContext {
  const context: ChatContext = {
    messages: [],
    filePathsOutbox: [],
    filePathsSent: [],
    filesSent: [],
  };
  return context;
}
