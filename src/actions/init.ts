import { confirm, password, select } from "@inquirer/prompts";
import * as theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";
import { Actions } from "./actions";
import { check } from "../commands/check/check";
import { selectModel } from "../commands/init/select-model";
import { saveApiKey, saveModel } from "../configuration/utils";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export type InitResult = {
  nextAction: Actions;
  updatedConfig: Configuration;
};

export async function init(
  executionContext: ExecutionContext,
  askNextAction: boolean,
): Promise<InitResult> {
  const interactive = executionContext.isTTYstdin;
  const updatedConfig = {
    ...executionContext.config,
  };

  //  We can only init when interactive.
  if (!interactive) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "'init' must be run interactively (TTY)",
    );
  }

  //  If we have an API key, offer to change it.
  if (updatedConfig.openAiApiKey !== "") {
    theme.printHint(
      "Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...",
    );
    const apiKey = await password({
      mask: true,
      message: "OpenAI API Key [leave blank to keep existing]:",
    });
    if (apiKey !== "") {
      updatedConfig.openAiApiKey = apiKey;
      saveApiKey(apiKey);
    }
  }

  //  If we don't have an API key, ask for one.
  if (updatedConfig.openAiApiKey === "") {
    theme.printHint(
      "Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...",
    );
    const apiKey = await password({ mask: true, message: "OpenAI API Key:" });
    updatedConfig.openAiApiKey = apiKey;
    saveApiKey(apiKey);
  }

  //  Offer advanced options.
  const advanced = await confirm({
    message: "Advanced Configuration (e.g. model)?",
    default: false,
  });
  if (advanced) {
    const model = await selectModel(updatedConfig.openai.model);
    if (model !== undefined) {
      updatedConfig.openai.model = model;
      saveModel(model);
    }
  }

  //  Offer to validate.
  const validate = await confirm({
    message: "Test API Key & Configuration?",
    default: true,
  });
  if (validate) {
    await check(executionContext);
  }

  //  Ask for the next action if we have chosen this option.
  if (!askNextAction) {
    return { nextAction: Actions.Unknown, updatedConfig };
  }
  const answer = await select({
    message: theme.inputPrompt("What next?"),
    default: "chat",
    choices: [
      {
        name: "Chat",
        value: "chat",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  });
  if (answer === "chat") {
    return { nextAction: Actions.Chat, updatedConfig };
  }

  return { nextAction: Actions.Quit, updatedConfig };
}
