import { confirm, select } from "@inquirer/prompts";
import { inputPrompt } from "../../theme";
import { ExecutionContext } from "../../execution-context/execution-context";
import { Commands } from "../commands";
import { check } from "../../commands/check/check";
import { initUpdateProviders } from "./init-update-providers";

export async function initRegularRun(
  executionContext: ExecutionContext,
  enableUpdateProvider: boolean,
  askNextAction: boolean,
): Promise<Commands> {
  //  If we are going to let the user update their provider, do so now.
  //  The only reason we don't do this is if this function is coming
  //  directly after the first-run init.
  if (enableUpdateProvider) {
    //  Offer advanced options.
    const updateProvider = await confirm({
      message: "Configure Provider (key, model, etc)?",
      default: false,
    });
    if (updateProvider) {
      await initUpdateProviders(executionContext);
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
