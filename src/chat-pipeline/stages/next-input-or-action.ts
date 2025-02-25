import { input } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import theme, { deleteLinesAboveCursor } from "../../theme";
import { nextAction } from "./next-action";
import { OpenAIMessage } from "../../lib/openai/openai-message";
import { ChatResponse } from "./parse-response";

export async function nextInputOrAction(
  params: ChatPipelineParameters,
  response: ChatResponse,
  messages: OpenAIMessage[],
): Promise<string> {
  //  Give the user a hint that they need to reply or show actions.
  theme.printHint("(Reply below or press Enter for more options...)");
  const chatInputPrompt = theme.inputPrompt("chat");
  const chatInput = await input({
    message: chatInputPrompt,
  });

  //  If the user gave us input, we can return it to the caller.
  if (chatInput !== "") {
    return chatInput;
  }

  //  Otherwise, we're going to show the actions menu and execute the next
  //  action. Clear the Chat prompt and Hint to make this cleaner.
  deleteLinesAboveCursor(2);
  await nextAction(params, false, messages, response);

  //  We performed an action, but still don't have input. Return an empty
  //  string, if the caller sees this they can close or they can simply
  //  ask for input again.
  return "";
}
