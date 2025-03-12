import { confirm, password, select } from "@inquirer/prompts";
import { TerminatingError } from "../lib/errors";
import * as theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import {
  Configuration,
  saveApiKey,
  saveModel,
} from "../configuration/configuration";
import { Actions } from "./actions";
import { check } from "../commands/check";
import { selectModel } from "../commands/init/select-model";

export type InitResult = {
  nextAction: Actions;
  updatedConfig: Configuration;
};

export async function init(
  executionContext: ExecutionContext,
  config: Configuration,
  askNextAction: boolean,
): Promise<InitResult> {
  const interactive = executionContext.isTTYstdin;
  const updatedConfig = {
    ...config,
  };

  //  We can only init when interactive.
  if (!interactive) {
    throw new TerminatingError("Error: 'init' can only be run interactively");
  }

  //  If we have an API key, offer to change it.
  if (config.openAiApiKey !== "") {
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
  if (config.openAiApiKey === "") {
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
    const model = await selectModel(config.openai.model);
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
    await check(executionContext, updatedConfig);
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
