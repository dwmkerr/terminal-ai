import colors from "colors/safe";
import { print } from "../../theme";
import { ExecutionContext } from "../../execution-context/execution-context";
import { Commands } from "../commands";
import { ErrorCode, TerminalAIError } from "../../lib/errors";
import { checkFirstRun } from "./check-first-run";
import { initFirstRun } from "./init-first-run";
import { initRegularRun } from "./init-regular-run";

export async function init(
  executionContext: ExecutionContext,
  askNextAction: boolean,
): Promise<Commands> {
  const interactive = executionContext.isTTYstdin;

  //  We can only init when interactive.
  if (!interactive) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "'init' must be run interactively (TTY)",
    );
  }

  console.log(print(`Welcome to ${colors.bold("Terminal AI")}\n`, interactive));

  //  Check whether we're in a first run (e.g. fresh install, or config blatted
  //  to the point we're fresh-install-like).
  const isFirstRun = checkFirstRun(executionContext);

  //  Fire the appropriate init handler.
  return isFirstRun
    ? await initFirstRun(executionContext, askNextAction)
    : await initRegularRun(executionContext, true, askNextAction);
}
