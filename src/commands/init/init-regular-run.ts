import { confirm, select } from "@inquirer/prompts";
import colors from "colors/safe";
import { inputPrompt, print } from "../../theme";
import { ExecutionContext } from "../../lib/execution-context";
import { Commands } from "../commands";
import { check } from "../../commands/check/check";
import { selectModel } from "../init/select-model";

export async function initRegularRun(
  executionContext: ExecutionContext,
  enableChangeApiKey: boolean,
  askNextAction: boolean,
): Promise<Commands> {
  const interactive = executionContext.isTTYstdin;
  const config = executionContext.config;

  //  If we are going to let the user change their key, do so now.
  //  The only reason we don't do this is if this function is coming
  //  directly after the first-run init.
  if (enableChangeApiKey) {
    console.log(
      print(`If you need a free API key follow the guide at:`, interactive),
    );
    console.log(
      print(
        `  ${colors.underline(colors.blue("https://github.com/dwmkerr/terminal-ai#api-key\n"))}`,
        interactive,
      ),
    );
    console.log(print(`TODO`, interactive));
    // const apiKey = await password({
    //   mask: true,
    //   message: "API Key (Press <Enter> to keep existing):",
    // });
    // if (apiKey !== "") {
    //   //  Note this is not ideal as we are mutating execution state, but needed
    //   //  as we might shortly run a _new_ command such as init.
    //   config.apiKey = apiKey;
    //   saveApiKey(apiKey);
    // }
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
      console.log(`TODO`);
      // saveModel(model);
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
