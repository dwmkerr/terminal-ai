import { input } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import theme from "../../theme";
import { ChatResponse } from "./get-response";
import { nextAction } from "./next-action";
import { OpenAIMessage } from "../../lib/openai/openai-message";

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
  //  action.
  process.stdout.write("\u001b[1A\u001b[K"); // Delete previous line and move cursor up
  process.stdout.write("\u001b[1A\u001b[K"); // Delete previous line and move cursor up
  await nextAction(params, response, messages);

  //  We performed an action, but still don't have input. Return an empty
  //  string, if the caller sees this they can close or they can simply
  //  ask for input again.
  return "";
}
