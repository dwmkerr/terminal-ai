import { formatMarkdown, isFormatted, stripFormatting } from "../lib/markdown";

export interface CustomMatchers<R = unknown> extends jest.Matchers<R> {
  toBeFormatted(expected: boolean): R;
  toMatchPlainText(expected: string): R;
}

function findFirstDifference(s1: string, s2: string) {
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] !== s2[i]) {
      return `First difference found at line ${i + 1}, char ${i + 1}: '${s1[i]}' vs '${s2[i]}'`;
    }
  }

  if (s1.length !== s2.length) {
    return `Strings differ in length starting from line ${Math.min(s1.length, s2.length) + 1}`;
  } else {
    return "No differences found between the strings!";
  }
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
    findFirstDifference(expected, plainText);
    debugger;

    return {
      pass,
      message: () =>
        pass
          ? `Expected string not to match unformatted version, but it did.`
          : `Expected:\n"${expected}"\n\nReceived:\n"${plainText}"`,
    };
  },
};
