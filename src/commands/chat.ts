import OpenAI from "openai";
import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";
import { ERROR_CODE_OPENAI_ERROR, TerminatingError } from "../lib/errors";

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string> {
  const openai = new OpenAI({
    baseURL: config.openai.baseURL,
    apiKey: config.openAiApiKey,
  });

  //  Send the input to ChatGPT and read the response.
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: config.openai.model,
    });

    //  Read the response. If we didn't get one, show an error. Otherwise
    //  print the response and add to the conversation history.
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new TerminatingError(
        "OpenAI Error - no response received. Try 'ai check' to validate your config",
        ERROR_CODE_OPENAI_ERROR,
      );
    }

    return response;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof OpenAI.PermissionDeniedError) {
      throw new TerminatingError(
        "OpenAI Permission Error - try 'ai check' to validate your config (model may be invalid)",
        ERROR_CODE_OPENAI_ERROR,
      );
    }
    if (err instanceof OpenAI.AuthenticationError) {
      throw new TerminatingError(
        "OpenAI Authentication Error - try 'ai check' to validate your config (API key may be invalid)",
        ERROR_CODE_OPENAI_ERROR,
      );
    }
    if (err instanceof OpenAI.RateLimitError) {
      throw new TerminatingError(
        "OpenAI Rate Limit Error - try 'ai check' and check your plan and billing details",
        ERROR_CODE_OPENAI_ERROR,
      );
    }
    //  Try and get an error code, fall back to the generic error message.
    const code = err["code"] || "<unknown>";
    throw new TerminatingError(
      `OpenAI Error '${code}' - try 'ai check' to validate your config`,
      ERROR_CODE_OPENAI_ERROR,
    );
  }
}
