import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";

import theme from "../../theme";
import { nextAction } from "../../chat-pipeline/stages/next-action";
import { ChatPipelineParameters } from "../../chat-pipeline/ChatPipelineParameters";
import { ExecutionContext } from "../../lib/execution-context";
import { Configuration } from "../../configuration/configuration";

export async function debugInput(
  executionContext: ExecutionContext,
  config: Configuration,
) {
  const params: ChatPipelineParameters = {
    executionContext,
    config,
    inputMessage: "",
    inputFilePaths: [],
    options: {
      enableContextPrompts: false,
      enableOutputPrompts: false,
      copy: false,
      raw: false,
    },
  };
  const chatInputPrompt = theme.inputPrompt("chat");
  let inputMessage = "";
  do {
    inputMessage = await advancedInput({
      message: chatInputPrompt,
      hint: "<Enter> Menu",
    });

    //  If the input message is empty then the user has just pressed 'enter' at
    //  the input prompt. This means we can show the initial input actions. This
    //  action might provide us with input, or it might not. If it doesn't,
    //  just keep on asking.
    if (inputMessage === "") {
      inputMessage = (await nextAction(params, true, [], undefined)) || "";
    }
  } while (inputMessage === "");
  return inputMessage;
}
