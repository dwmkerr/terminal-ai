export enum FileInputType {
  File,
  ImageFile,
}

export interface FileInput {
  type: FileInputType;
  path: string;
  content: string;
  isBinary: boolean;
  mimeType: string;
  encoding: "utf-8" | "base64";
  mimeTypeWithEncoding: string;
}
