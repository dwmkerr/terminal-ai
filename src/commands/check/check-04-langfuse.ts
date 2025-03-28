import { ErrorCode } from "../../lib/errors";
import { ExecutionContext } from "../../execution-context/execution-context";
import { translateError } from "../../lib/translate-error";
import { printError, printMessage, startSpinner } from "../../theme";

export async function checkLangfuse(executionContext: ExecutionContext) {
  const interactive = executionContext.isTTYstdin;

  //  If we don't have langfuse integration, we can bail.
  const lf = executionContext.integrations?.langfuse;
  if (lf === undefined) {
    return;
  }

  //  Let the user know how long we'll wait. Note we're cheekily trying to check
  //  what the internal langfuse flush interval is.
  const monitorSeconds =
    ((lf.langfuse["flushInterval"] as number) || 30000) / 1000;
  const spinner = await startSpinner(
    interactive,
    `Integration: Langfuse - checking for config errors, this can take up to ${monitorSeconds}s...`,
  );

  //  Capture errors.
  let caughtError = null;
  lf.langfuse.on("error", (error) => {
    caughtError = error;
  });

  //  Create an event. This should be pushed to the LF server async in the
  //  background - we'll listen for errors.
  try {
    lf.trace.event({
      name: "ai-check-langfuse",
    });
    await lf.langfuse.flushAsync();
  } catch (err) {
    spinner.stop();
    console.log(
      printError(
        "❌ Error performing Langfuse checks, exiting...",
        interactive,
      ),
    );
    throw translateError(err);
  }
  spinner.succeed();

  //  Disconnect the error handler. Check for errors.
  lf.langfuse.on("error", () => undefined);
  if (caughtError) {
    console.log(
      printError(`❌ Langfuse error captured: ${caughtError}...`, interactive),
    );
    process.exit(ErrorCode.Connection);
  }
  console.log(
    printMessage(
      `⚠️ Integration: Langfuse - no errors in ${monitorSeconds}s, but as per issue #70 some errors may not be caught...`,
      interactive,
    ),
  );
}
