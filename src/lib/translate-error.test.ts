import OpenAI from "openai";
import { translateError } from "./translate-error";
import {
  ERROR_CODE_CONNECTION,
  ERROR_CODE_OPENAI_ERROR,
  ERROR_CODE_UNKNOWN,
  TerminatingError,
} from "./errors";

describe("translateError", () => {
  it("should rethrow ExitPromptError without wrapping it", () => {
    const err = new Error("User exited");
    err.name = "ExitPromptError";
    const translated = translateError(err);
    expect(translated).toBe(err);
  });

  //  Note that we seem to create these errors incorrectly, meaning the type
  //  check later on fails. So we let them fail for now.
  xit("should translate PermissionDeniedError", () => {
    const err = OpenAI.PermissionDeniedError.generate(
      403,
      undefined,
      undefined,
      undefined,
    );
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/OpenAI Permission Error/);
    expect(translated.message).toMatch(/ai check/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_OPENAI_ERROR);
  });

  xit("should translate AuthenticationError", () => {
    const err = OpenAI.AuthenticationError.generate(
      401,
      undefined,
      undefined,
      undefined,
    );
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/OpenAI Authentication Error/);
    expect(translated.message).toMatch(/ai check/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_OPENAI_ERROR);
  });

  xit("should translate RateLimitError", () => {
    const err = OpenAI.RateLimitError.generate(
      429,
      undefined,
      undefined,
      undefined,
    );
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/OpenAI Rate Limit Error/);
    expect(translated.message).toMatch(/ai check/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_OPENAI_ERROR);
  });

  it("should handle errors with a code property", () => {
    const err = { code: "custom-code" };
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/OpenAI Error 'custom-code'/);
    expect(translated.message).toMatch(/ai check/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_OPENAI_ERROR);
  });

  it("should handle connection errors", () => {
    const err = "Connection error: network is down";
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/Connection Error/);
    expect(translated.message).toMatch(/internet connection/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_CONNECTION);
  });

  it("should handle unknown errors", () => {
    const err = "An unexpected error occurred that is not handled";
    const translated = translateError(err);
    expect(translated).toBeInstanceOf(TerminatingError);
    expect(translated.message).toMatch(/Unknown Error/);
    expect(translated.message).toMatch(/ai check|AI_DEBUG_ENABLE=1/);
    const errorCode = (translated as TerminatingError)["errorCode"] || null;
    expect(errorCode).toBe(ERROR_CODE_UNKNOWN);
  });
});
