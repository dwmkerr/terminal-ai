import { FileInput, FileInputType } from "./file-input";
import { loadFileInput } from "./load-file-input";

describe("input", () => {
  const testWhitePixelPath =
    "./src/input/file-input/test-files/test-white-pixel.jpg";
  const testMarkdownCodePath =
    "./src/input/file-input/test-files/test-markdown-code.md";
  const testCodeNoExtensionPath =
    "./src/input/file-input/test-files/test-code-no-extension";

  describe("fileInput", () => {
    describe("loadFileInput", () => {
      it("can load a test markdown code file", async () => {
        const fileInput = await loadFileInput(testMarkdownCodePath);
        const expected: FileInput = {
          type: FileInputType.File,
          path: "./src/input/file-input/test-files/test-markdown-code.md",
          encoding: "utf-8",
          isBinary: false,
          mimeType: "text/markdown",
          mimeTypeWithEncoding: "text/markdown",
          content: `\`\`\`js
export interface FileInput {
  path: string;
  contents: string;
}
\`\`\`
`,
        };
        expect(fileInput).toStrictEqual(expected);
      });

      it("can load a test test code file with no extension", async () => {
        const fileInput = await loadFileInput(testCodeNoExtensionPath);
        const expected: FileInput = {
          type: FileInputType.File,
          path: "./src/input/file-input/test-files/test-code-no-extension",
          encoding: "utf-8",
          isBinary: false,
          mimeType: "text/plain", // note we don't know the exact type, so its text
          mimeTypeWithEncoding: "text/plain",
          content: `export interface FileInput {
  path: string;
  contents: string;
}
`,
        };
        expect(fileInput).toStrictEqual(expected);
      });

      it("can load a test binary image file", async () => {
        const fileInput = await loadFileInput(testWhitePixelPath);
        const expected: FileInput = {
          type: FileInputType.File,
          path: "./src/input/file-input/test-files/test-white-pixel.jpg",
          encoding: "base64",
          isBinary: true,
          mimeType: "image/jpeg", // it's jpeg...
          mimeTypeWithEncoding: "image/jpeg;base64", // ...but base64 encoded
          content:
            "/9j/4AAQSkZJRgABAQEASABIAAD/4QBGRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAExAAIAAAAUAAAAWodpAAQAAAABAAAAagAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAJigAwAEAAAAAQAAAJgAAAAA/9sAQwABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/9sAQwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/wAARCABkAGQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EABYQAQEBAAAAAAAAAAAAAAAAAAMAAf/aAAwDAQACEAMQAAAB0gAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwCf/9k",
        };
        expect(fileInput).toStrictEqual(expected);
      });

      it("throws with a FileLoadError if file is missing", async () => {
        const call = async () => await loadFileInput("missing.txt");
        await expect(call).rejects.toThrow(/missing.txt/);
      });
    });
  });
});
