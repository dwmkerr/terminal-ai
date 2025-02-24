import { ChatAction } from "./ChatAction";

export const ReplyAction: ChatAction = {
  id: "reply",
  displayNameInitial: "Chat",
  displayNameReply: "Reply",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async (): Promise<string | undefined> => undefined,
};
