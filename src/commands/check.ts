import OpenAI from "openai";
import {
  ERROR_CODE_INVALID_CONFIGURATION,
  ERROR_CODE_OPENAI_ERROR,
  TerminatingError,
} from "../lib/errors";
import * as theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";

export async function check(
  executionContext: ExecutionContext,
  config: Configuration,
): Promise<string | null> {
  const interactive = executionContext.isTTYstdin;

  //  Check we have an API key.
  if (config.openAiApiKey === "") {
    throw new TerminatingError(
      "Error: Your OpenAI API key is not set, try 'ai init'",
      ERROR_CODE_INVALID_CONFIGURATION,
    );
  }

  const openai = new OpenAI({
    baseURL: config.openai.baseURL,
    apiKey: config.openAiApiKey,
  });

  console.log(theme.printMessage("Checking configuration...", interactive));

  try {
    //  Call any API to check our key.
    const models = await openai.models.list();
    if (models) {
      console.log(theme.printMessage("OpenAI API Key validated", interactive));
    }
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof OpenAI.AuthenticationError) {
      throw new TerminatingError(
        "Error: Your API key appears to be invalid, try 'ai init'",
        ERROR_CODE_INVALID_CONFIGURATION,
      );
    }
  }

  //  We can check the model against the API models.
  let page = await openai.models.list();
  let apiModels: string[] = [];
  while (page) {
    apiModels = [...apiModels, ...page.data.map((m) => m.id)];
    if (!page.hasNextPage()) {
      break;
    }
    page = await page.getNextPage();
  }
  if (apiModels.includes(config.openai.model)) {
    console.log(theme.printMessage("OpenAI Model validated", interactive));
  } else {
    console.log(
      theme.printWarning(
        `Warning: Your OpenAI Model '${config.openai.model}' is the ${apiModels.length} models available from the OpenAI APIs - this may indicate misconfiguration`,
        interactive,
      ),
    );
  }

  //  Check for rate limit - this check will also check the model.
  try {
    await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: "user", content: "Testing rate limit..." }],
    });
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    //  We get a 403 with an invalid model...
    if (err instanceof OpenAI.PermissionDeniedError) {
      throw new TerminatingError(
        `Error: failed to call chat API - your model '${config.openai.model}' may be invalid...`,
        ERROR_CODE_INVALID_CONFIGURATION,
      );
    }
    if (err instanceof OpenAI.RateLimitError) {
      throw new TerminatingError(
        "Warning: OpenAI rate limit exceeded for token, check your plan and billing details",
        ERROR_CODE_INVALID_CONFIGURATION,
      );
    }
    //  Try and get an error code, fall back to the generic error message.
    const code = err["code"] || "<unknown>";
    throw new TerminatingError(
      `Unexpected OpenAI Error '${code}'`,
      ERROR_CODE_OPENAI_ERROR,
    );
  }
  console.log(theme.printMessage("OpenAI Token Rate Limit", interactive));

  console.log(
    theme.printMessage("Configuration validated", executionContext.isTTYstdout),
  );

  return "";
}
