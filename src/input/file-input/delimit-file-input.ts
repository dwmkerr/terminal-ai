import { FileInput } from "./file-input";

export function delimitFileInputForChat(fileInput: FileInput): string {
  //  Construct the start and end file delimiter.
  const startFileDelimiter = `--- BEGIN FILE: ${fileInput.path} (${fileInput.mimeTypeWithEncoding}) ---`;
  const endFileDelimiter = `--- END FILE ---`;

  //  Return the delimited file content.
  return `${startFileDelimiter}\n${fileInput.content}\n${endFileDelimiter}`;
}
