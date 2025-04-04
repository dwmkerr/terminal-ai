import { delimitFileInputForChat } from "./delimit-file-input";
import { FileInput, FileInputType } from "./file-input";

describe("input", () => {
  describe("fileInput", () => {
    describe("delimit-file-input", () => {
      it("can delimit file input for chat", () => {
        const fileInput: FileInput = {
          type: FileInputType.File,
          path: "./src/my-code.ts",
          isBinary: false,
          encoding: "utf-8",
          mimeType: "application/javascript",
          mimeTypeWithEncoding: "application/javascript",
          content: "console.log('test');",
        };
        const content = delimitFileInputForChat(fileInput);

        //  Expect the correct token structure.
        expect(content)
          .toBe(`--- BEGIN FILE: ./src/my-code.ts (application/javascript) ---
console.log('test');
--- END FILE ---`);
      });
    });
  });
});
