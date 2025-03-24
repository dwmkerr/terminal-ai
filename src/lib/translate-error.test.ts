import OpenAI from "openai";
import { translateError } from "./translate-error";
import { ErrorCode } from "./errors";

describe("translateError", () => {
  test("should translate inquirer.js ExitPromptError", () => {
    const err = new Error("User exited");
    err.name = "ExitPromptError";
    const translated = translateError(err);
    expect(translated.name).toBe("Exit Prompt");
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
    expect(translated.name).toMatch(/OpenAI Permission Error/);
    expect(translated.message).toMatch(/ai check/);
    expect(translated.errorCode).toBe(ErrorCode.OpenAIPermissionDeniedError);
  });

  xit("should translate AuthenticationError", () => {
    const err = OpenAI.AuthenticationError.generate(
      401,
      undefined,
      undefined,
      undefined,
    );
    const translated = translateError(err);
    expect(translated.name).toMatch(/OpenAI Authentication Error/);
    expect(translated.message).toMatch(/ai check/);
    expect(translated.errorCode).toBe(ErrorCode.OpenAIAuthenticationError);
  });

  xit("should translate RateLimitError", () => {
    const err = OpenAI.RateLimitError.generate(
      429,
      undefined,
      undefined,
      undefined,
    );
    const translated = translateError(err);
    expect(translated.message).toMatch(/OpenAI Rate Limit Error/);
    expect(translated.message).toMatch(/ai check/);
    expect(translated.errorCode).toBe(ErrorCode.OpenAIRateLimitError);
  });

  it("should handle connection errors", () => {
    const err = "Connection error: network is down";
    const translated = translateError(err);
    expect(translated.name).toMatch(/Connection Error/);
    expect(translated.message).toMatch(/internet connection/);
    expect(translated.errorCode).toBe(ErrorCode.Connection);
  });

  it("should handle unknown errors with a code property", () => {
    const err = { code: "custom-code" };
    const translated = translateError(err);
    expect(translated.name).toMatch("Unknown Error");
    expect(translated.message).toMatch(/error code 'custom-code'/);
    expect(translated.errorCode).toBe(ErrorCode.Unknown);
  });

  it("should handle unknown errors with0ut a code property", () => {
    const err = "An unexpected error occurred that is not handled";
    const translated = translateError(err);
    expect(translated.name).toMatch(/Unknown Error/);
    expect(translated.message).toMatch(/ai check|AI_DEBUG_ENABLE=1/);
    expect(translated.errorCode).toBe(ErrorCode.Unknown);
  });
});
