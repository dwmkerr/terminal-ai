import OpenAI, { BadRequestError } from "openai";
import dbg from "debug";
import { ErrorCode, TerminalAIError } from "./errors";
import { crop } from "../print/crop";

const debug = dbg("ai:error");

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function translateError(err: any): TerminalAIError {
  debug("translating error:");
  debug(JSON.stringify(err, null, 2));

  //  If we're already translated, great.
  if (err instanceof TerminalAIError) {
    return err;
  }

  //  Inquirer.js throws this error if we close a prompt (e.g. with Ctrl+C). In
  //  some cases such as menus we handle it, in other cases we let it bubble and
  //  close the app.
  if (err instanceof Error && err.name === "ExitPromptError") {
    return new TerminalAIError(ErrorCode.ExitPrompt, "shutting down...", err);
  }

  //  We have a few different bad request types.
  //  - uploading image content for a model that doesn't support image input
  if (err instanceof BadRequestError) {
    //  Deconstruct the error.
    const error = err as BadRequestError;
    const msg =
      (error.error as Record<string, string>)?.["message"] || "bad request";

    //  Handle specific error scenarios.
    if (/image_url is only supported by certain models/.test(msg)) {
      return new TerminalAIError(
        ErrorCode.CompatibilityError,
        "this model does not support image processing",
        err,
      );
    }

    //  Handle generic 400 errors.
    return new TerminalAIError(ErrorCode.OpenAIBadRequestError, msg, err);
  }

  if (err instanceof OpenAI.PermissionDeniedError) {
    return new TerminalAIError(
      ErrorCode.OpenAIPermissionDeniedError,
      "api key or model may be invalid, try 'ai check' to check your config",
      err,
    );
  }

  //  Check for invalid key.
  if (
    err instanceof OpenAI.AuthenticationError || // openai error message
    /400 API key not valid/.test(err) // gemini error message
  ) {
    return new TerminalAIError(
      ErrorCode.OpenAIAuthenticationError,
      "try 'ai check' to validate your config (API key may be invalid)",
      err,
    );
  }

  if (err instanceof OpenAI.RateLimitError) {
    return new TerminalAIError(
      ErrorCode.OpenAIRateLimitError,
      "try 'ai check' and check your plan and billing details",
      err,
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
      err,
    );
  }
  //  - standard nodejs connection error...
  if (code === "ENOTFOUND") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "address not found - check your internet connection",
      err,
    );
  }
  //  - standard nodejs connection error...
  if (code === "ECONNREFUSED") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "connection refused - check your internet connection",
      err,
    );
  }
  //  - tls error...
  if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
    return new TerminalAIError(
      ErrorCode.Connection,
      "tls altname invalid - check your internet connection",
      err,
    );
  }
  //  - invalid url error...
  if (err.code === "ERR_INVALID_URL") {
    return new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      "Invalid URL - check your configuration",
      err,
    );
  }

  //  We don't know what the error is but it DOES have a code...
  if (code) {
    return new TerminalAIError(
      ErrorCode.Unknown,
      `error code '${code}' - try 'ai check' to validate your config`,
      err,
    );
  }

  //  ...we don't have a clue what the error is and it doesn't have a code.
  const preview = crop(`${err}`, 80);
  return new TerminalAIError(
    ErrorCode.Unknown,
    `try 'ai check' or AI_DEBUG_ENABLE=1\n -> ${preview}`,
  );
}
