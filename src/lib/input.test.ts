import { OutputIntent, parseInput } from "./input";

describe("input", () => {
  describe("parseInput", () => {
    test("parses input without intent", () => {
      expect(parseInput("python to sort note the colon : here")).toEqual({
        message: "python to sort note the colon : here",
        outputIntent: OutputIntent.Unknown,
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
        outputIntent: OutputIntent.Unknown,
      });
    });

    test("handles multiline input", () => {
      expect(
        parseInput(
          "code: create python script\nto sort then make executable and run",
        ),
      ).toEqual({
        message: "create python script\nto sort then make executable and run",
        outputIntent: OutputIntent.Code,
      });
    });
  });
});
