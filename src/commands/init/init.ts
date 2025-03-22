import { confirm, password, select } from "@inquirer/prompts";
import colors from "colors/safe";
import { inputPrompt, print } from "../../theme";
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

  console.log(print(`Welcome to ${colors.bold("Terminal AI")}\n`, interactive));

  //  We are in our 'first run' if no API key has been set.
  const isFirstRun = config.apiKey === "";

  //  First run, we can show the welcome message and ask for an API key.
  if (isFirstRun) {
    console.log(
      print(
        `Enter your OpenAI / Gemini API key to get started.
If you need a free API key follow the guide at:`,
        interactive,
      ),
    );
    console.log(
      print(
        `  ${colors.underline(colors.blue("https://github.com/dwmkerr/terminal-ai#api-key\n"))}`,
        interactive,
      ),
    );
    const apiKey = await password({
      mask: true,
      message: "API Key:",
      validate: (key) => (key === "" ? "API key is required" : true),
    });
    config.apiKey = apiKey;
    saveApiKey(apiKey);
  }

  //  If we're not in the first run, we can offer to change the API key as the
  //  first part of init.
  if (!isFirstRun) {
    console.log(
      print(`If you need a free API key follow the guide at:`, interactive),
    );
    console.log(
      print(
        `  ${colors.underline(colors.blue("https://github.com/dwmkerr/terminal-ai#api-key\n"))}`,
        interactive,
      ),
    );
    const apiKey = await password({
      mask: true,
      message: "API Key (Press <Enter> to keep existing):",
    });
    if (apiKey !== "") {
      //  Note this is not ideal as we are mutating execution state, but needed
      //  as we might shortly run a _new_ command such as init.
      config.apiKey = apiKey;
      saveApiKey(apiKey);
    }
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
    default: false,
  });
  if (validate) {
    await check(executionContext);
  }

  //  Ask for the next action if we have chosen this option.
  if (!askNextAction) {
    return Commands.Unknown;
  }
  const answer = await select({
    message: inputPrompt("What next?"),
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
