import colors from "colors/safe";
import { marked } from "marked";

//  We're going to 'require' as there are not up to date type definitions
//  for marked-terminal.
//  eslint-disable-next-line
const loadedModule: any = require("marked-terminal");

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
  marked.use(loadedModule.markedTerminal());

  //  If we are non-interactive, we will simply write the result as plain
  //  text and return (no formatting).
  if (!interactive) {
    console.log(message);
  }

  //  We are interactive, so first we'll write the ChatGPT reponse prompt,
  //  then the markdown content styled for the terminal.
  const markdownOutput = marked.parse(message);
  console.log(colors.white(colors.bold("chatgpt: ")), markdownOutput);
}

export default {
  printWarning,
  printError,
  inputPrompt,
  printResponse,
};
