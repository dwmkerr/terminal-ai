import colors from "colors/safe";
import { formatMarkdown } from "../lib/markdown";

export function printResponse(
  prompt: string,
  message: string,
  interactive: boolean,
): string {
  //  If we are non-interactive, we will simply write the result as plain
  //  text and return (no formatting).
  if (!interactive) {
    return message;
  }

  //  We are interactive, so first we'll write the ChatGPT reponse prompt,
  //  then the markdown content styled for the terminal. Also clear trailing
  //  newlines. However, if we have code output we don't want to trim the
  //  beginning.
  const markdownOutput = formatMarkdown(message);
  const trimmedMarkdownOutput = message.trim().startsWith("```")
    ? "\n\n" + markdownOutput
    : markdownOutput.trim();

  //  If our output starts with a newline, we don't need a 'space' after the
  //  prompt.
  const newLineOutput = trimmedMarkdownOutput.startsWith("\n");
  const separator = newLineOutput ? "" : " ";

  //  Clear trailing newlines.
  return (
    colors.white(colors.bold(`${prompt}:`)) + separator + trimmedMarkdownOutput
  );
}
