import colors from "colors/safe";
import { stripFormatting } from "./lib/markdown";

export function deleteLinesAboveCursor(count: number) {
  for (let i = 0; i < count; i++) {
    // Delete previous line and move cursor up
    process.stdout.write("\u001b[1A\u001b[K");
  }
}

export function print(message: string, interactive: boolean) {
  return interactive ? message : stripFormatting(message);
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

export function printHint(hint: string, interactive: boolean) {
  return interactive ? colors.gray(hint) : hint;
}

export async function startSpinner(_: boolean, text: string = "") {
  // We might not need to override whether it is interactive?
  // if (!interactive) {
  //   return {
  //     stop: () => undefined,
  //     succeed: () => undefined,
  //     fail: () => undefined,
  //   };
  // }
  const ora = (await import("ora")).default;
  return ora(text).start();
}

export default {
  printMessage,
  printWarning,
  printError,
  inputPrompt,
  printHint,
};
