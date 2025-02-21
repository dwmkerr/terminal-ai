import { ChatAction } from "./ChatAction";

export const ReplyAction: ChatAction = {
  id: "reply",
  displayName: "Reply",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async () => {},
};
