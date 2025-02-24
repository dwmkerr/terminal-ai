import { ChatAction } from "./ChatAction";

export const QuitAction: ChatAction = {
  id: "quit",
  displayNameInitial: "Quit",
  displayNameReply: "Quit",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async () => {
    process.exit(0);
  },
};
