import { stripVTControlCharacters } from "util";
import { marked } from "marked";

//  We're going to 'require' as there are not up to date type definitions
//  for marked-terminal.
//  eslint-disable-next-line
const loadedModule: any = require("marked-terminal");

export function formatMarkdown(input: string): string {
  marked.use(loadedModule.markedTerminal());
  return marked.parse(input) as string;
}

export function stripFormatting(input: string): string {
  return stripVTControlCharacters(input);
}

export function plainTextCode(input: string): string {
  const markdownIndented = formatMarkdown(input);
  const markdown = markdownIndented.replace(/^ {4}/gm, "");
  return stripFormatting(markdown);
}
