import dbg from "debug";
import { input } from "@inquirer/prompts";
import OpenAI from "openai";
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
  const openai = new OpenAI({
    apiKey: cfg.openAiApiKey,
  });

  //  Create a converstion history that we will maintain as we interact.
  //  Add any chat prompts.
  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    [];
  config.prompts.chat.context.forEach((prompt) => {
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

    //  Send the input to ChatGPT and read the response.
    try {
      const completion = await openai.chat.completions.create({
        messages: conversationHistory,
        model: "gpt-3.5-turbo",
      });

      //  Read the response. If we didn't get one, show an error. Otherwise
      //  print the response and add to the conversation history.
      const response = completion.choices[0]?.message?.content;
      if (!response) {
        theme.printError("No response received from ChatGPT...");
      } else {
        theme.printResponse(response);
        conversationHistory.push({ role: "assistant", content: response });
      }
    } catch (error) {
      theme.printError("Error calling ChatGPT", error);
    }
  }
}
