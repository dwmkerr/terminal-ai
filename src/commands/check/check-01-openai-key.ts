import OpenAI from "openai";
import { ErrorCode } from "../../lib/errors";
import { translateError } from "../../lib/translate-error";
import { printError, startSpinner } from "../../theme";

export async function checkOpenAIKey(
  interactive: boolean,
  openai: OpenAI,
  key: string,
) {
  //  Check we have an API key.
  if (key === "") {
    console.log(
      printError(
        "❌ API key is not set, try 'ai init' or check ~/.ai.config",
        interactive,
      ),
    );
    process.exit(ErrorCode.InvalidConfiguration);
  }

  //  See if we can list models, this'll check the key...
  const spinner = await startSpinner(interactive, "Checking API key...");
  try {
    //  Call any API to check our key. Models is an easy one.
    await openai.models.list();
  } catch (err) {
    spinner.stop();
    const error = translateError(err);
    if (error.errorCode === ErrorCode.OpenAIAuthenticationError) {
      console.log(
        printError(
          "❌ Authentication Error: your API key appears to be invalid, try 'ai init'",
          interactive,
        ),
      );
      process.exit(error.errorCode);
    }
    if (error.errorCode === ErrorCode.OpenAIPermissionDeniedError) {
      console.log(
        printError(
          "❌ Permission Denied Error: your API key may be expired, try 'ai init'",
          interactive,
        ),
      );
      process.exit(error.errorCode);
    }
    throw error;
  }
  spinner.succeed();
}
