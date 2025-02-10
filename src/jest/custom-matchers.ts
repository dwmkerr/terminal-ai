import { formatMarkdown, isFormatted, stripFormatting } from "../lib/markdown";

export interface CustomMatchers<R = unknown> extends jest.Matchers<R> {
  toBeFormatted(expected: boolean): R;
  toMatchPlainText(expected: string): R;
}

export const customMatchers: jest.ExpectExtendMap = {
  toBeFormatted(
    //  eslint-disable-next-line  @typescript-eslint/no-explicit-any
    this: jest.MatcherContext & { equals: (a: any, b: any) => boolean },
    received: string,
    expected: boolean,
  ): jest.CustomMatcherResult {
    //  If our received text is not identical to its own plaintext, then we can
    //  assume that's because we have formatting.
    const formatted = isFormatted(received);

    return {
      pass: formatted === expected,
      message: () =>
        `Expected string to ${expected ? "be" : "not be"} formatted, but got:\n\n${received}`,
    };
  },

  toMatchPlainText(
    //  eslint-disable-next-line  @typescript-eslint/no-explicit-any
    this: jest.MatcherContext & { equals: (a: any, b: any) => boolean },
    received: string,
    expected: string,
  ): jest.CustomMatcherResult {
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
