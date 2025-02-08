import util from "util";
import child_process from "child_process";
import colors from "colors/safe";

import { TerminatingWarning } from "./errors";

const exec = util.promisify(child_process.exec);

export async function assertConfirmation(
  //  Commander JS uses 'any' for options, so disable the warning.
  //  eslint-disable-next-line  @typescript-eslint/no-explicit-any
  options: any,
  confirmationFlag: string,
  message: string,
) {
  //  If the user has provided the required confirmation option, we can return
  //  safely.
  if (options[confirmationFlag] === true) {
    return;
  }

  //  The user has not provided the required confirmation flag, so we must warn
  //  and fail.
  throw new TerminatingWarning(message);
}

export async function execCommand(command: string) {
  const { stdout, stderr } = await exec(command);
  if (stderr) {
    console.log(colors.red(stderr));
  }
  if (stdout) {
    console.log(colors.white(stdout));
  }
}
