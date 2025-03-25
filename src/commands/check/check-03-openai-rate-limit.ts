import OpenAI from "openai";
import { ErrorCode } from "../../lib/errors";
import { translateError } from "../../lib/translate-error";
import { printError, startSpinner } from "../../theme";

export async function checkOpenAIRateLimit(
  interactive: boolean,
  openai: OpenAI,
  model: string,
) {
  //  See if we can list models, this'll check the key...
  const spinner = await startSpinner(
    interactive,
    "Checking API key rate limit...",
  );
  //  Check for rate limit - this check will also check the model.
  try {
    await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Testing rate limit..." }],
    });
  } catch (err) {
    spinner.stop();
    const error = translateError(err);

    //  We get a 403 with an invalid model...
    if (error.errorCode === ErrorCode.OpenAIRateLimitError) {
      console.log(
        printError(
          "❌ Rate limit exceeded for API key, check your plan and billing details",
          interactive,
        ),
      );
      process.exit(error.errorCode);
    }
    throw error;
  }
  spinner.succeed();
}
