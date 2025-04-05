import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import theme from "../../theme";
import { nextAction } from "./next-action";
import { ChatResponse } from "./parse-response";
import { formatChatMenuHint } from "../../ui/format-chat-menu-hint";
import { terminalWidth } from "../../ui/terminal";

export async function nextInputOrAction(
  params: ChatPipelineParameters,
  response: ChatResponse,
  messages: ChatCompletionMessageParam[],
): Promise<string> {
  //  Give the user a hint that they need to reply or show actions.
  const chatInputPrompt = theme.inputPrompt("chat");
  const chatInput = await advancedInput({
    message: chatInputPrompt,
    hint: formatChatMenuHint(
      terminalWidth(params.executionContext.process),
      params.executionContext.config.ui.showProviderAndModel
        ? params.executionContext.provider
        : undefined,
    ),
  });

  //  If the user gave us input, we can return it to the caller.
  if (chatInput !== "") {
    return chatInput;
  }

  //  Otherwise, we're going to show the actions menu and execute the next
  //  action. Clear the Chat prompt and Hint to make this cleaner.
  //  If the action provides input, great, we can return it. If it doesn't
  //  then the caller will most likely just re-trigger this menu.
  return (await nextAction(params, false, messages, response)) || "";

  // //  We performed an action, but still don't have input. Return an empty
  // //  string, if the caller sees this they can close or they can simply
  // //  ask for input again.
  // return "";
}
