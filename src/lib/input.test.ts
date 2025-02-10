import { OutputIntent, parseInput } from "./input";

describe.skip("input", () => {
  describe("parseInput", () => {
    test("parses input without intent", () => {
      expect(parseInput("python to sort note the colon : here")).toEqual({
        message: "python to sort note the colon : here",
        outputIntent: OutputIntent.Chat,
      });
    });

    test("parses input with intent", () => {
      expect(parseInput("code: python to sort note the colon : here")).toEqual({
        message: "python to sort note the colon : here",
        outputIntent: OutputIntent.Code,
      });
    });

    test("does not treat text with whitespace before a colon as intent", () => {
      expect(
        parseInput("this is code: python to sort note the colon : here"),
      ).toEqual({
        message: "this is code: python to sort note the colon : here",
        outputIntent: OutputIntent.Chat,
      });
    });
  });
});
