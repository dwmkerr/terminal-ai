import { ErrorCode } from "../../lib/errors";
import { translateError } from "../../lib/translate-error";
import { printError, startSpinner } from "../../theme";
import dns from "dns";

export async function checkConnection(interactive: boolean) {
  const spinner = await startSpinner(
    interactive,
    "Checking internet connection...",
  );
  try {
    await dns.promises.resolve("google.com");
  } catch (err) {
    spinner.stop();
    const error = translateError(err);
    if (error.errorCode === ErrorCode.Connection) {
      console.log(
        printError(
          "❌ Connection error - check your internet connection",
          interactive,
        ),
      );
      process.exit(error.errorCode);
    }
    throw error;
  }
  spinner.succeed();
}
