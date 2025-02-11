import { formatMarkdown, isFormatted, stripFormatting } from "../lib/markdown";

export interface CustomMatchers<R = unknown> extends jest.Matchers<R> {
  toBeFormatted(expected: boolean): R;
  toMatchPlainText(expected: string): R;
}

export const customMatchers: jest.ExpectExtendMap = {
  toBeFormatted(received: string, expected: boolean) {
    const formatted = isFormatted(received);

    return {
      pass: formatted === expected,
      message: () =>
        `Expected string to ${expected ? "be" : "not be"} formatted, but got:\n\n${received}`,
    };
  },

  toMatchPlainText(received: string, expected: string) {
    const plainText = stripFormatting(formatMarkdown(received));
    const pass = plainText === expected;

    return {
      pass,
      message: () =>
        pass
          ? `Expected string not to match unformatted version, but it did.`
          : `Expected:\n"${expected}"\n\nReceived:\n"${plainText}"`,
    };
  },
};
