import { FileInput } from "../input/file-input/file-input";

export type ChatContext = {
  filePathsOutbox: string[];
  filePathsSent: string[];
  filesSent: FileInput[];
};

export function initialChatContext(): ChatContext {
  const context: ChatContext = {
    filePathsOutbox: [],
    filePathsSent: [],
    filesSent: [],
  };
  return context;
}
