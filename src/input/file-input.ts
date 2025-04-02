import fs from "fs/promises";
import { isBinaryFile } from "isbinaryfile";
import mime from "mime-types";

export interface FileInput {
  path: string;
  content: string;
  isBinary: boolean;
  mimeType: string;
  encoding: "utf-8" | "base64";
  mimeTypeWithEncoding: string;
}

export async function loadFileInput(path: string): Promise<FileInput> {
  //  First, determine whether we're dealing with a binary file.
  const isBinary = await isBinaryFile(path);

  //  If we can lookup a mime type that's great. If not, binary will be an
  //  octet stream and text will be 'text/plain'.
  const mimeType =
    mime.lookup(path) || (isBinary ? "application/octet-stream" : "text/plain");

  //  Set the file encoding we will use.
  const encoding = isBinary ? "base64" : "utf-8";

  //  The mimeTypeWithEncoding is the full specification of data - the mime type as
  //  well as the specific encoding used. In most cases, e.g. text, this is
  //  just the mime type. In the cases of binary files it's the mime type but
  //  also the indicator that it is base64 encoded.
  const mimeTypeWithEncoding = isBinary ? `${mimeType};${encoding}` : mimeType;

  //  The fthe file contents and return the full input file.
  const content = await fs.readFile(path, { encoding });
  return { path, content, isBinary, mimeType, encoding, mimeTypeWithEncoding };
}

export function delimitFileInputForChat(fileInput: FileInput): string {
  //  Construct the start and end file delimiter.
  const startFileDelimiter = `--- BEGIN FILE: ${fileInput.path} (${fileInput.mimeTypeWithEncoding}) ---`;
  const endFileDelimiter = `--- END FILE ---`;

  //  Return the delimited file content.
  return `${startFileDelimiter}\n${fileInput.content}\n${endFileDelimiter}`;
}
