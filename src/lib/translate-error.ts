import OpenAI from "openai";
import dbg from "debug";
import { ErrorCode, TerminalAIError } from "./errors";

const debug = dbg("ai:error");

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function translateError(err: any): TerminalAIError {
  //  If we're already translated, great.
  if (err instanceof TerminalAIError) {
    return err;
  }

  //  Inquirer.js throws this error if we close a prompt (e.g. with Ctrl+C). In
  //  some cases such as menus we handle it, in other cases we let it bubble and
  //  close the app.
  if (err instanceof Error && err.name === "ExitPromptError") {
    return new TerminalAIError(ErrorCode.ExitPrompt, "shutting down...");
  }

  if (err instanceof OpenAI.PermissionDeniedError) {
    return new TerminalAIError(
      ErrorCode.OpenAIPermissionDeniedError,
      "api key or model may be invalid, try 'ai check' to check your config",
    );
  }

  if (err instanceof OpenAI.AuthenticationError) {
    return new TerminalAIError(
      ErrorCode.OpenAIAuthenticationError,
      "try 'ai check' to validate your config (API key may be invalid)",
    );
  }

  if (err instanceof OpenAI.RateLimitError) {
    return new TerminalAIError(
      ErrorCode.OpenAIRateLimitError,
      "try 'ai check' and check your plan and billing details",
    );
  }

  //  Try and get an error code...
  const code = err["code"];

  //  Check for the various connection errors we've seen...
  //  - openai janky fallback connection err...
  if (/Connection error/.test(err)) {
    return new TerminalAIError(
      ErrorCode.Connection,
      "check your internet connection",
    );
  }
  //  - standard nodejs connection error...
  if (code === "ENOTFOUND") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "address not found - check your internet connection",
    );
  }
  //  - standard nodejs connection error...
  if (code === "ECONNREFUSED") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "connection refused - check your internet connection",
    );
  }
  //  - tls error...
  if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "tls altname invalid - check your internet connection",
    );
  }

  //  We don't know what the error is but it DOES have a code...
  if (code) {
    return new TerminalAIError(
      ErrorCode.Unknown,
      `error code '${code}' - try 'ai check' to validate your config`,
    );
  }

  //  ...we don't have a clue what the error is and it doesn't have a code.
  const preview = `${err}`.substring(0, 20) + "...";
  debug(JSON.stringify(err, null, 2));
  return new TerminalAIError(
    ErrorCode.Unknown,
    `'${preview}' - try 'ai check' or AI_DEBUG_ENABLE=1`,
  );
}
