import "jest"; // Import Jest's existing types

// Extend Jest matchers
declare module "jest" {
  interface Matchers<R> {
    toBeFormatted(expected: boolean): R;
    toMatchPlainText(expected: string): R;
  }
}
