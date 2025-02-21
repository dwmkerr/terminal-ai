import { editor } from "@inquirer/prompts";
import { ChatAction } from "./ChatAction";
import { execCommand } from "../lib/cli-helpers";

export const FullscreenInputAction: ChatAction = {
  id: "Fullscreen Input",
  displayName: "fullscreen_input",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async () => {
    const code = await editor({
      message: "Ready to provide fullscreen input?",
      default: "",
      postfix: "txt",
    });
    await execCommand(code, true);
  },
};
