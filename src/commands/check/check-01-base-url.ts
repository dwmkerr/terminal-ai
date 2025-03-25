import dns from "dns";
import { ErrorCode } from "../../lib/errors";
import { translateError } from "../../lib/translate-error";
import { printError, startSpinner } from "../../theme";

export async function checkBaseURL(interactive: boolean, baseURL: string) {
  //  Check we have a base url.
  if (baseURL === "") {
    console.log(
      printError(
        "❌ Base URL is not set, try 'ai init' or check ~/.ai.config",
        interactive,
      ),
    );
    process.exit(ErrorCode.InvalidConfiguration);
  }

  //  Start a spinner and make sure we can hit the base url.
  const spinner = await startSpinner(
    interactive,
    `Checking Base URL ${baseURL}...`,
  );
  const hostname = new URL(baseURL).hostname;
  try {
    await dns.promises.lookup(hostname);
  } catch (err) {
    spinner.stop();
    const error = translateError(err);
    if (error.errorCode === ErrorCode.Connection) {
      console.log(
        printError(
          `❌ Check Base URL Failed: your Base URL hostname '${hostname}' appears to be invalid, try 'ai init'`,
          interactive,
        ),
      );
      process.exit(error.errorCode);
    }
    throw error;
  }
  spinner.succeed();
}
