import { ErrorCode } from "../../lib/errors";
import { ExecutionContext } from "../../lib/execution-context";
import { translateError } from "../../lib/translate-error";
import { printError, printMessage, startSpinner } from "../../theme";

export async function checkLangfuse(executionContext: ExecutionContext) {
  const interactive = executionContext.isTTYstdin;

  //  If we don't have langfuse integration, we can bail.
  const lf = executionContext.integrations?.langfuse;
  if (lf === undefined) {
    console.log(
      printMessage(
        "integration: langfuse - not enabled, skipping",
        interactive,
      ),
    );
    return;
  }

  //  Let the user know how long we'll wait. Note we're cheekily trying to check
  //  what the internal langfuse flush interval is.
  const monitorSeconds = lf.langfuse["flushInterval"] as number;
  const spinner = await startSpinner(
    interactive,
    `Monitoring for Langfuse background errors, this will take ${monitorSeconds}s...`,
  );

  //  Capture errors.
  let err = null;
  lf.langfuse.on("error", (error) => {
    console.log(error);
    err = error;
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
  spinner.stop();

  //  Disconnect the error handler. Check for errors.
  lf.langfuse.on("error", () => undefined);
  if (err) {
    console.log(
      printError(`❌ Langfuse error captured: ${err}...`, interactive),
    );
    process.exit(ErrorCode.Connection);
  }
  console.log(
    printMessage(
      `✅ Langfuse tested - no errors in ${monitorSeconds}s`,
      interactive,
    ),
  );
  console.log(
    printMessage(
      `⚠️  Langfuse testing has bugs (#70) , always check your traces are logged`,
      interactive,
    ),
  );
}
