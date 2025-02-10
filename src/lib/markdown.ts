import { stripVTControlCharacters } from "util";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

export function formatMarkdown(input: string): string {
  //  Format the markdown. Strip the trailing newlines that marked-terminal
  //  seems to add.
  marked.use(markedTerminal());
  const formatted = marked.parse(input) as string;
  const trimmed = formatted.replace(/\n+$/, "");
  const indentedWhitespaceRemoved = trimmed.replace(/^[ \t]*$/gm, "");
  return indentedWhitespaceRemoved;
}

export function stripFormatting(input: string): string {
  return stripVTControlCharacters(input).replace(/\x1B\[[0-9;]*[JKmsu]/g, "");
}

export function plainTextCode(input: string): string {
  const markdownIndented = formatMarkdown(input);
  //  Remove the leading four spaces when we have it.
  const markdown = markdownIndented.replace(/^ {4}/gm, "");
  return stripFormatting(markdown);
}

export function isFormatted(input: string): boolean {
  //  Compare the string to the stripped string - if they are the same then
  //  there is no formatting.
  const stripped = stripFormatting(input);
  return input !== stripped;
}
