import dbg from "debug";
import { input } from "@inquirer/prompts";
import OpenAI from "openai";
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
) {
  // This will run when no command is specified
  if (!executionContext.isInteractive) {
    throw new TerminatingWarning(
      "Chat is not supported in non-interactive mode",
    );
  }

  //  If we don't have an API key, ask for one. Create the OpenAI interface.
  const cfg = await ensureApiKey(executionContext, config);

  //  Create a converstion history that we will maintain as we interact.
  //  Add any chat prompts.
  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    [];
  cfg.prompts.chat.context.forEach((prompt) => {
    const expanded = expandEnvVars(prompt, process.env);
    debug(`prompt: ${expanded}`);
    conversationHistory.push({
      role: "user",
      content: expanded,
    });
  });

  //  Repeatedly interact with ChatGPT until the user terminates.
  while (true) {
    //  Read the user input. Add to the conversation.
    const userInput = await input({ message: "chat:" });
    conversationHistory.push({ role: "user", content: userInput });

    const response = await chatCommand(
      executionContext,
      cfg,
      conversationHistory,
    );
    if (!response) {
      theme.printError("No response received from ChatGPT...");
    } else {
      theme.printResponse(response);
      conversationHistory.push({ role: "assistant", content: response });
    }
  }
}
