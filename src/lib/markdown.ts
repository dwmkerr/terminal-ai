import { stripVTControlCharacters } from "util";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

export function formatMarkdown(input: string): string {
  //  Format the markdown. Strip the trailing newlines that marked-terminal
  //  seems to add.
  marked.use(markedTerminal());
  const formatted = marked.parse(input) as string;
  const trimmed = formatted.replace(/\n+$/, "");
  return trimmed;
}

export function stripFormatting(input: string): string {
  return stripVTControlCharacters(input);
}

export function plainTextCode(input: string): string {
  const markdownIndented = formatMarkdown(input);
  const markdown = markdownIndented.replace(/^ {4}/gm, "");
  return stripFormatting(markdown);
}

export function isFormatted(input: string): boolean {
  //  Compare the string to the stripped string - if they are the same then
  //  there is no formatting.
  const stripped = stripFormatting(input);
  return input !== stripped;
}
