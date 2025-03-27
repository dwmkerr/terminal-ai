import { ExecutionContext } from "../../execution-context/execution-context";
import { init } from "../../commands/init/init";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export async function ensureApiKey(executionContext: ExecutionContext) {
  //  If we already have a key, we're done.
  if (executionContext.provider.apiKey !== "") {
    return;
  }

  //  We don't have a key, if we're not interactive on stdin and stdout we
  //  cannot continue. Note that the error message will be in the output,
  //  so keep it short.
  if (!executionContext.isTTYstdin || !executionContext.isTTYstdout) {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      "api key not configured",
    );
  }

  //  Initialise, this will mutate execution context to set the key, or die
  //  trying.
  return await init(executionContext, true);
}
