import { expect } from "@jest/globals";
import { customMatchers, CustomMatchers } from "./custom-matchers";

// Extend Jest's matchers
expect.extend(customMatchers);

declare module "@jest/expect" {
  interface Matchers<R> extends CustomMatchers<R> {}
}
