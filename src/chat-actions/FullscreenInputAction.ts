import { editor } from "@inquirer/prompts";
import { ChatAction } from "./ChatAction";

export const FullscreenInputAction: ChatAction = {
  id: "fullscreen_input",
  displayNameInitial: "Chat (Fullscreen)",
  displayNameReply: "Reply (Fullscreen)",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async () => {
    const input = await editor({
      message: "Ready to provide fullscreen input?",
      default: "",
      postfix: "txt",
      waitForUseInput: false,
    });
    //  Delete the previous line, i.e. the selection line, so that the output
    //  stays clean.
    process.stdout.write("\u001b[1A" + "\u001b[2K");
    console.log(input);

    //  Return the input. If it is truthy, it'll be used as the input to the
    //  chat.
    return input;
  },
};
