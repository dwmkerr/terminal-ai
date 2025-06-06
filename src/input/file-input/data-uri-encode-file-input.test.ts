import { dataUriEncodeFileInput } from "./data-uri-encode-file-input";
import { FileInput, FileInputType } from "./file-input";

describe("input", () => {
  describe("fileInput", () => {
    describe("dataUriEncodeFileInput", () => {
      it("can delimit file input for chat", () => {
        const fileInput: FileInput = {
          type: FileInputType.File,
          path: "./src/input/file-input/test-files/test-white-pixel.jpg",
          encoding: "base64",
          isBinary: true,
          mimeType: "image/jpeg", // it's jpeg...
          mimeTypeWithEncoding: "image/jpeg;base64", // ...but base64 encoded
          content:
            "/9j/4AAQSkZJRgABAQEASABIAAD/4QBGRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAExAAIAAAAUAAAAWodpAAQAAAABAAAAagAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAJigAwAEAAAAAQAAAJgAAAAA/9sAQwABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/9sAQwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/wAARCABkAGQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EABYQAQEBAAAAAAAAAAAAAAAAAAMAAf/aAAwDAQACEAMQAAAB0gAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwCf/9k",
        };
        const dataUri = dataUriEncodeFileInput(fileInput);

        //  Expect the correct data uri structure.
        expect(dataUri).toBe(
          `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBGRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAExAAIAAAAUAAAAWodpAAQAAAABAAAAagAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAJigAwAEAAAAAQAAAJgAAAAA/9sAQwABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/9sAQwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/wAARCABkAGQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EABYQAQEBAAAAAAAAAAAAAAAAAAMAAf/aAAwDAQACEAMQAAAB0gAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwCf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwCf/9k`,
        );
      });
    });
  });
});
