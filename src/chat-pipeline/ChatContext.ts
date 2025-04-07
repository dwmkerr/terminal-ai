import OpenAI from "openai";
import { FileInput } from "../input/file-input/file-input";

export type ChatContext = {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

  //  Files to send and files sent.
  filePathsOutbox: string[];
  filePathsSent: string[];
  filesSent: FileInput[];

  //  Images to send and images sent.
  imageFilePathsOutbox: string[];
  imageFilePathsSent: string[];
  imageFilesSent: FileInput[];
};

export function initialChatContext(): ChatContext {
  const context: ChatContext = {
    messages: [],
    filePathsOutbox: [],
    filePathsSent: [],
    filesSent: [],
    imageFilePathsOutbox: [],
    imageFilePathsSent: [],
    imageFilesSent: [],
  };
  return context;
}
