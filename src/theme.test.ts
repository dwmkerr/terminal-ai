import { describe, expect, test } from "@jest/globals";
import colors from "colors/safe";
import { printResponse } from "./theme";

describe("theme", () => {
  beforeAll(() => {
    //  Colors are automatically disabled when we don't have a TTY (e.g. in
    //  GitHub actions) - this makes the tests fail as we're testing ASCII
    //  color code outputs. So force them in tests.
    colors.enable();
  });

  describe("printResponse", () => {
    test("correctly prints single line response", () => {
      expect(printResponse("Good morning", true)).toBeFormatted(true);
      expect(printResponse("Good morning", true)).toMatchPlainText(
        "chatgpt: Good morning",
      );

      expect(printResponse("Good morning", false)).toBeFormatted(false);
      expect(printResponse("Good morning", false)).toMatchPlainText(
        "Good morning",
      );
    });

    test("correctly prints a single code block response", () => {
      const rawResponse = `\`\`\`python
import os

folder_name = "new_folder"

if not os.path.exists(folder_name):
    os.makedirs(folder_name)
\`\`\``;

      const formattedResponse = printResponse(rawResponse, true);
      expect(formattedResponse).toBeFormatted(true);
      //  Note the title, indentation and leading/trailing whitespace.
      expect(formattedResponse).toMatchPlainText(`chatgpt:

    import os

    folder_name = "new_folder"

    if not os.path.exists(folder_name):
        os.makedirs(folder_name)`);
    });
  });
});
