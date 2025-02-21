import { ChatAction } from "./ChatAction";

export const QuitAction: ChatAction = {
  id: "quit",
  displayName: "Quit",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async () => {
    process.exit(0);
  },
};
