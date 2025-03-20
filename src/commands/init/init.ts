import { confirm, password, select } from "@inquirer/prompts";
import * as theme from "../../theme";
import { ExecutionContext } from "../../lib/execution-context";
import { Commands } from "../commands";
import { check } from "../../commands/check/check";
import { selectModel } from "../init/select-model";
import { saveApiKey, saveModel } from "../../configuration/utils";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export async function init(
  executionContext: ExecutionContext,
  askNextAction: boolean,
): Promise<Commands> {
  const interactive = executionContext.isTTYstdin;
  const config = executionContext.config;

  //  We can only init when interactive.
  if (!interactive) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "'init' must be run interactively (TTY)",
    );
  }

  //  If we have an API key, offer to change it.
  if (config.apiKey !== "") {
    theme.printHint(
      "Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...",
    );
    const apiKey = await password({
      mask: true,
      message: "OpenAI API Key [leave blank to keep existing]:",
    });
    if (apiKey !== "") {
      //  Note this is not ideal as we are mutating execution state, but needed
      //  as we might shortly run a _new_ command such as init.
      config.apiKey = apiKey;
      saveApiKey(apiKey);
    }
  }

  //  If we don't have an API key, ask for one.
  if (config.apiKey === "") {
    theme.printHint(
      "Check https://github.com/dwmkerr/terminal-ai#api-key for API key help...",
    );
    const apiKey = await password({ mask: true, message: "OpenAI API Key:" });
    config.apiKey = apiKey;
    saveApiKey(apiKey);
  }

  //  Offer advanced options.
  const advanced = await confirm({
    message: "Advanced Configuration (e.g. model)?",
    default: false,
  });
  if (advanced) {
    const model = await selectModel(config.model);
    if (model !== undefined) {
      config.model = model;
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
    return Commands.Unknown;
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
    return Commands.Chat;
  }

  return Commands.Quit;
}
