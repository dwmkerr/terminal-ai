import dbg from "debug";
import { input } from "@inquirer/prompts";
import { chat as chatCommand } from "../commands/chat";
import theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { TerminatingWarning } from "../lib/errors";
import { Configuration } from "../configuration/configuration";
import { ensureApiKey } from "./ensure-api-key";
import expandEnvVars from "../lib/expand-env-vars";

const debug = dbg("ai:chat");

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
) {
  //  If we don't have an API key, ask for one. Create the OpenAI interface.
  const cfg = await ensureApiKey(executionContext, config);

  //  Our chat input will be the initial input if set, otherwise we'll have
  //  to prompt for it. We can also set the chat input params to have a nice
  //  color.
  const chatInputMessgae = theme.inputPrompt("chat");
  let chatInput = inputMessage || "";
  if (chatInput === "") {
    //  We need to ask for input. If we're non interactive, we must fail.
    if (!executionContext.isInteractive) {
      throw new TerminatingWarning(
        "The 'input' argument is required, try 'ai -- \"good morning\"",
      );
    }
    chatInput = await input({ message: chatInputMessgae });
  }

  //  Create a converstion history that we will maintain as we interact.
  //  Add any chat prompts.
  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    [];

  //  If context prompts are enabled, add them now.
  if (enableContextPrompts) {
    cfg.prompts.chat.context.forEach((prompt) => {
      const expanded = expandEnvVars(prompt, process.env);
      debug(`hydrated context prompt: ${expanded}`);
      conversationHistory.push({
        role: "user",
        content: expanded,
      });
    });
  }

  //  Repeatedly interact with ChatGPT as long as we have chat input.
  while (chatInput !== "") {
    conversationHistory.push({ role: "user", content: chatInput });
    const response = await chatCommand(
      executionContext,
      cfg,
      conversationHistory,
    );
    if (!response) {
      theme.printError("No response received from ChatGPT...");
    } else {
      theme.printResponse(response, executionContext.isInteractive);
      conversationHistory.push({ role: "assistant", content: response });
    }

    //  Clear the next chat input. If we're interactive, we can continue the
    //  conversation
    chatInput = "";
    if (executionContext.isInteractive) {
      console.log(""); // write a newline to make things more readable.
      chatInput = await input({ message: chatInputMessgae });
    }
  }
}
