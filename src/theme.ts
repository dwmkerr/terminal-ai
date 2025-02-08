import colors from "colors/safe";
// import { marked } from "marked";
// // import TerminalRenderer from "marked-terminal";

import { BoxState } from "./box";

function boxId(boxId: string) {
  //  TODO colors.white.bold should work, but typescript complains...
  return colors.white(colors.bold(boxId));
}

function state(state: BoxState) {
  switch (state) {
    case BoxState.Pending:
      return colors.yellow("pending");
    case BoxState.Running:
      return colors.green("running");
    case BoxState.ShuttingDown:
      return colors.red("shutting down");
    case BoxState.Terminated:
      return colors.gray("terminated");
    case BoxState.Stopping:
      return colors.yellow("stopping");
    case BoxState.Stopped:
      return colors.red("stopped");
    case BoxState.Unknown:
    default:
      return colors.red("unknown");
  }
}

function printBoxHeading(box: string, boxState?: BoxState) {
  console.log(`${boxId(box)}${boxState ? `: ${state(boxState)}` : ""}`);
}

function printBoxDetail(name: string, value: string) {
  console.log(`  ${colors.white(name)}: ${colors.white(value)}`);
}

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
  boxId,
  state,
  printBoxHeading,
  printBoxDetail,
  printWarning,
  printError,
  inputPrompt,
  printResponse,
};
