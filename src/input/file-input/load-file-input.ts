import fs from "fs/promises";
import { isBinaryFile } from "isbinaryfile";
import mime from "mime-types";
import { FileInput, FileInputType } from "./file-input";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export async function loadFileInput(
  path: string,
  type: FileInputType,
): Promise<FileInput> {
  try {
    //  First, determine whether we're dealing with a binary file.
    const isBinary = await isBinaryFile(path);

    //  If we can lookup a mime type that's great. If not, binary will be an
    //  octet stream and text will be 'text/plain'.
    const mimeType =
      mime.lookup(path) ||
      (isBinary ? "application/octet-stream" : "text/plain");

    //  Set the file encoding we will use.
    const encoding = isBinary ? "base64" : "utf-8";

    //  The mimeTypeWithEncoding is the full specification of data - the mime type as
    //  well as the specific encoding used. In most cases, e.g. text, this is
    //  just the mime type. In the cases of binary files it's the mime type but
    //  also the indicator that it is base64 encoded.
    const mimeTypeWithEncoding = isBinary
      ? `${mimeType};${encoding}`
      : mimeType;

    //  Grab the file contents and return the full input file.
    const content = await fs.readFile(path, { encoding });
    return {
      type,
      path,
      content,
      isBinary,
      mimeType,
      encoding,
      mimeTypeWithEncoding,
    };
  } catch (err) {
    throw new TerminalAIError(
      ErrorCode.FileLoadError,
      `error loading '${path}'`,
      err,
    );
  }
}
