import OpenAI from "openai";
import {
  ERROR_CODE_INVALID_CONFIFGURATION,
  TerminatingWarning,
} from "../lib/errors";
import * as theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";

export async function check(
  executionContext: ExecutionContext,
  config: Configuration,
): Promise<string | null> {
  const interactive = executionContext.isInteractive;

  //  Check we have an API key.
  if (config.openAiApiKey === "") {
    throw new TerminatingWarning(
      "Warning: Your OpenAI API key is not set, try 'ai init'",
      ERROR_CODE_INVALID_CONFIFGURATION,
    );
  }

  const openai = new OpenAI({
    apiKey: config.openAiApiKey,
  });

  console.log(theme.printMessage("Checking configuration...", interactive));

  try {
    const models = await openai.models.list();
    if (models) {
      console.log(theme.printMessage("OpenAP API Key validated", interactive));
    }
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof OpenAI.AuthenticationError) {
      throw new TerminatingWarning(
        "Warning: Your API key appears to be invalid, try 'ai init'",
        ERROR_CODE_INVALID_CONFIFGURATION,
      );
    }
  }

  console.log(
    theme.printMessage(
      "Configuration validated",
      executionContext.isInteractive,
    ),
  );

  return "";
}
