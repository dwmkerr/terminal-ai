import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";

import theme from "../../theme";
import { nextAction } from "../../chat-pipeline/stages/next-action";
import { ChatPipelineParameters } from "../../chat-pipeline/ChatPipelineParameters";
import { ExecutionContext } from "../../execution-context/execution-context";
import { initialChatContext } from "../../chat-pipeline/ChatContext";

export async function debugInput(executionContext: ExecutionContext) {
  const params: ChatPipelineParameters = {
    executionContext,
    chatContext: initialChatContext(),
    inputMessage: "",
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
