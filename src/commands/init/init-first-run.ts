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

  //  We now continue with a regular init run.
  return await initRegularRun(executionContext);
}
