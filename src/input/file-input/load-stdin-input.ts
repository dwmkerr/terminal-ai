import { isBinaryFile } from "isbinaryfile";
import { StdStreamLike } from "../../execution-context/execution-context";
import { FileInput, FileInputType } from "./file-input";

export async function loadStdinInput(
  stdin: StdStreamLike,
): Promise<FileInput | undefined> {
  return new Promise((resolve, reject) => {
    //  If std is interactive tnen there's no input to stream.
    if (stdin.isTTY) {
      return resolve(undefined);
    }

    //  Read the input data until we hit the end of the stream.
    const chunks: Buffer[] = [];
    stdin.on("data", (chunk) => chunks.push(chunk));
    stdin.on("end", async () => {
      //  We have the chunks, create a single resulting buffer. Determine
      //  whether it is binary and encode the content appropriately.
      const buffer = Buffer.concat(chunks);
      const isBinary = await isBinaryFile(buffer);
      const mimeType = isBinary ? "application/octet-stream" : "text/plain";
      const encoding = isBinary ? "base64" : "utf-8";
      const fileInput: FileInput = {
        type: FileInputType.File, // assume a standard file
        path: "-", // i.e. stdin
        content: buffer.toString(isBinary ? "base64" : "utf-8"),
        isBinary,
        mimeType,
        encoding,
        mimeTypeWithEncoding: isBinary ? `${mimeType};${encoding}` : mimeType,
      };

      resolve(fileInput);
    });
    stdin.on("error", (e) => {
      reject(e);
    });
  });
}
