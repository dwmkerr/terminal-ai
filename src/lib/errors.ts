export const enum ErrorCode {
  //  Fallback when we cannot determine what the error is (e.g. we cannot
  //  translate an upstream error).
  Unknown = 1,
  ExitPrompt = 11,
  InvalidConfiguration = 12,
  Connection = 13,
  InvalidOperation = 14,
  FileLoadError = 15,
  CompatibilityError = 16,
  OpenAIError = 20,
  OpenAIPermissionDeniedError = 21,
  OpenAIAuthenticationError = 22,
  OpenAIRateLimitError = 23,
  OpenAIBadRequestError = 24,

  //  Integrations.
  LangfuseError = 30,
}

export function errorCodeName(errorCode: ErrorCode): string {
  switch (errorCode) {
    case ErrorCode.Unknown:
      return "Unknown Error";
    case ErrorCode.ExitPrompt:
      return "Exit Prompt";
    case ErrorCode.InvalidConfiguration:
      return "Invalid Configuration";
    case ErrorCode.Connection:
      return "Connection Error";
    case ErrorCode.InvalidOperation:
      return "Invalid Operation";
    case ErrorCode.FileLoadError:
      return "File Load Error";
    case ErrorCode.CompatibilityError:
      return "Compatibility Error";
    case ErrorCode.OpenAIError:
      return "OpenAI Error";
    case ErrorCode.OpenAIPermissionDeniedError:
      return "OpenAI Permission Denied";
    case ErrorCode.OpenAIAuthenticationError:
      return "OpenAI Authentication Error";
    case ErrorCode.OpenAIRateLimitError:
      return "OpenAI Rate Limit Error";
    case ErrorCode.OpenAIBadRequestError:
      return "OpenAI Bad Request Error";

    //  Integrations.
    case ErrorCode.LangfuseError:
      return "Langfuse Error";

    default:
      return "Unknown Error";
  }
}

//  When we call 'translateError' we will always transform into this error type.
export class TerminalAIError extends Error {
  errorCode: ErrorCode;
  innerError: Error | unknown | undefined;
  constructor(
    errorCode: ErrorCode,
    message: string,
    innerError: Error | unknown | undefined = undefined,
  ) {
    super(message);
    this.name = errorCodeName(errorCode);
    this.errorCode = errorCode;
    this.innerError = innerError;
    Object.setPrototypeOf(this, TerminalAIError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
