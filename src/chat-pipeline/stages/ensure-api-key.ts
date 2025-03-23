import { ExecutionContext } from "../../lib/execution-context";
import { init } from "../../commands/init/init";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export async function ensureApiKey(executionContext: ExecutionContext) {
  //  If we already have a key, we're done.
  if (executionContext.config.apiKey !== "") {
    return;
  }

  //  We don't have a key, if we're not interactive on stdin we cannot continue.
  //  Note that the error message will be in the output, so keep it short.
  if (!executionContext.isTTYstdin) {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      "api key not configured",
    );
  }

  //  Initialis, this will mutate execution context to set the key, or die
  //  trying.
  return await init(executionContext, true);
}
