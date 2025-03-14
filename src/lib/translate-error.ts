import OpenAI from "openai";
import dbg from "debug";
import {
  ERROR_CODE_CONNECTION,
  ERROR_CODE_OPENAI_ERROR,
  ERROR_CODE_UNKNOWN,
  TerminatingError,
} from "./errors";

const debug = dbg("ai:error");

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function translateError(err: any): Error {
  //  Inquirer.js exit prompt errors that we don't explicitly catch must be
  //  re-thrown - the cli.ts entrypoint will gracefully close the app. However
  //  in many cases we should handle this explicitly, e.g. to allow things like
  //  the actions menu to be closed with ctrl+c.
  if (err instanceof Error && err.name === "ExitPromptError") {
    return err;
  }

  if (err instanceof OpenAI.PermissionDeniedError) {
    return new TerminatingError(
      "OpenAI Permission Error - try 'ai check' to validate your config (model may be invalid)",
      ERROR_CODE_OPENAI_ERROR,
    );
  }
  if (err instanceof OpenAI.PermissionDeniedError) {
    return new TerminatingError(
      "OpenAI Permission Error - try 'ai check' to validate your config (model may be invalid)",
      ERROR_CODE_OPENAI_ERROR,
    );
  }
  if (err instanceof OpenAI.AuthenticationError) {
    return new TerminatingError(
      "OpenAI Authentication Error - try 'ai check' to validate your config (API key may be invalid)",
      ERROR_CODE_OPENAI_ERROR,
    );
  }
  if (err instanceof OpenAI.RateLimitError) {
    return new TerminatingError(
      "OpenAI Rate Limit Error - try 'ai check' and check your plan and billing details",
      ERROR_CODE_OPENAI_ERROR,
    );
  }

  //  Try and get an error code - this means we've probably got an OpenAI error...
  const code = err["code"];
  if (code) {
    return new TerminatingError(
      `OpenAI Error '${code}' - try 'ai check' to validate your config`,
      ERROR_CODE_OPENAI_ERROR,
    );
  }

  //  Check for the various connection errors we've seen...
  //  - openai janky fallback connection err...
  if (/Connection error/.test(err)) {
    return new TerminatingError(
      `Connection Error - check your internet connection`,
      ERROR_CODE_CONNECTION,
    );
  }

  //  We don't have a clue what the error is...
  const preview = `${err}`.substring(0, 20) + "...";
  debug(JSON.stringify(err, null, 2));
  return new TerminatingError(
    `Unknown Error '${preview}' - try 'ai check' or AI_DEBUG_ENABLE=1`,
    ERROR_CODE_UNKNOWN,
  );
}
