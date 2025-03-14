import colors from "colors/safe";
import { formatMarkdown } from "./lib/markdown";

export function deleteLinesAboveCursor(count: number) {
  for (let i = 0; i < count; i++) {
    // Delete previous line and move cursor up
    process.stdout.write("\u001b[1A\u001b[K");
  }
}

export function printMessage(message: string, interactive: boolean) {
  return interactive ? colors.white(message) : message;
}

export function printWarning(message: string, interactive: boolean) {
  return interactive ? colors.yellow(message) : message;
}

export function printError(message: string, interactive: boolean) {
  return interactive ? colors.red(message) : message;
}

export function inputPrompt(prompt: string): string {
  return colors.white(colors.bold(`${prompt}:`));
}

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

export function printHint(hint: string) {
  // This needs to be configurable.

  // Move cursor up using ANSI escape codes
  console.log();
  console.log(colors.gray(hint));
  // process.stdout.write("\u001b[1A"); // Move cursor up by 1 line
  // console.log("          " + colors.gray(hint));
  // process.stdout.write("\u001b[1A"); // Move cursor up by 1 line
}

export async function startSpinner(interactive: boolean, text: string = "") {
  if (!interactive) {
    return { stop: () => undefined };
  }
  const ora = (await import("ora")).default;
  return ora(text).start();
}

export default {
  printMessage,
  printWarning,
  printError,
  inputPrompt,
  printResponse,
  printHint,
};
