export const ERROR_CODE_WARNING = 1;
export const ERROR_CODE_INVALID_CONFIFGURATION = 2;
export const ERROR_CODE_CONNECTION = 3;
export const ERROR_CODE_OPENAI_ERROR = 4;

export class TerminatingWarning extends Error {
  errorCode: number;
  constructor(message: string, errorCode: number = ERROR_CODE_WARNING) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, TerminatingWarning.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TerminatingError extends Error {
  errorCode: number;
  constructor(message: string, errorCode: number = ERROR_CODE_WARNING) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, TerminatingError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
