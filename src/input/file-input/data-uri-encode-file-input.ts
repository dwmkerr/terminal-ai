import { FileInput } from "./file-input";

export function dataUriEncodeFileInput(fileInput: FileInput): string {
  //  e.g. 'data:image/jpeg;base65,<content>'.
  const uri = `data:${fileInput.mimeTypeWithEncoding},`;
  return `${uri}${fileInput.content}`;
}
