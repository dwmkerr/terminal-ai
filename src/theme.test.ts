import { describe, expect, test } from "@jest/globals";
import { printResponse } from "./theme";

describe("theme", () => {
  describe("printResponse", () => {
    test.skip("correctly prints single line response", () => {
      expect(printResponse("Good morning", true)).toBeFormatted(true);
      expect(printResponse("Good morning", true)).toMatchPlainText(
        "chatgpt: Good morning",
      );

      expect(printResponse("Good morning", false)).toBeFormatted(false);
      expect(printResponse("Good morning", false)).toMatchPlainText(
        "Good morning",
      );
    });

    test.skip("correctly prints single code block response", () => {
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
