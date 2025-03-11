import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";
import { TerminatingWarning } from "../../lib/errors";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import theme from "../../theme";
import { nextAction } from "./next-action";

export async function initialInput(
  params: ChatPipelineParameters,
): Promise<string> {
  //  If we have been provided chat input at the command line, for example:
  //    ai -- "what is ai?"
  //  then we can return.
  if (params.inputMessage) {
    return params.inputMessage;
  }

  //  At a later point, the next thing we would try would be to see if we are
  //  being piped input, i.e. whether stdin has anything we can read.
  //  See Issue: #40

  //  We have no initial message. If we are non-interactive at stdin, we are
  //  going to have to fail (as there is no way we can ask for input).
  if (!params.executionContext.isTTYstdin) {
    throw new TerminatingWarning(
      "The 'input' argument is required, try 'ai -- \"good morning\"",
    );
  }

  //  We are going to ask for input. Create a prompt, read and return.
  //  If we have no input, we'll just ask again. Later on, we will have 'input
  //  actions' which work similarly to 'output actions' - a menu which pops
  //  up when you just hit enter.
  //  See Issue: #41
  const chatInputPrompt = theme.inputPrompt("chat");
  let inputMessage = "";
  do {
    inputMessage = await advancedInput({
      message: chatInputPrompt,
      hint: "<Enter> Show Menu",
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
