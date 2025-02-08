import colors from "colors/safe";
// import { marked } from "marked";
// // import TerminalRenderer from "marked-terminal";

function printWarning(message: string) {
  console.log(colors.yellow(message));
}

export function printError(message: string, ...args: unknown[]) {
  console.log(colors.red(message), args);
}

export function inputPrompt(prompt: string): string {
  return colors.white(colors.bold(`${prompt}:`));
}

export function printResponse(message: string, interactive: boolean) {
  //  Write markdown.
  //

  // marked.use({ renderer: new TerminalRenderer() });
  // const response = marked.parse(message);

  if (interactive) {
    console.log(colors.white(colors.bold("chatgpt: ")) + message);
  } else {
    console.log(message);
  }
}

export default {
  printWarning,
  printError,
  inputPrompt,
  printResponse,
};
