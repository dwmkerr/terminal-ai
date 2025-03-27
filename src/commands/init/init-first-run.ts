import colors from "colors/safe";
import { print } from "../../theme";
import { ExecutionContext } from "../../execution-context/execution-context";
import { Commands } from "../commands";
import { initRegularRun } from "./init-regular-run";
import { initSetProviderApiKey } from "./init-set-provider-api-key";

/**
 * initFirstRun.
 *
 * @param {ExecutionContext} executionContext
 * @param {boolean} askNextAction
 * @returns {Promise<Commands>}
 */
export async function initFirstRun(
  executionContext: ExecutionContext,
  askNextAction: boolean,
): Promise<Commands> {
  const interactive = executionContext.isTTYstdin;

  console.log(
    print(
      `An OpenAI or compatible key is required.
To get a free key follow the guide at:`,
      interactive,
    ),
  );
  console.log(
    print(
      `  ${colors.underline(colors.blue("https://github.com/dwmkerr/terminal-ai#api-key\n"))}`,
      interactive,
    ),
  );
  await initSetProviderApiKey(executionContext);

  //  We now continue with a regular init run (which'll offer the option to
  //  update the model, whatever). However, we don't ask the user if they want
  //  to change their API key.
  return await initRegularRun(executionContext, false, askNextAction);
}
