//  Note that 'clipboardy' and 'open' require dynamic imports so that this
//  can be packaged as a commonjs module. The dyanmic imports are directly
//  used in the 'connect' function below.
// import clipboard from "clipboardy";
import { getBoxes } from "../lib/get-boxes";
import { getConfiguration } from "../lib/configuration";
import { TerminatingWarning } from "../lib/errors";
import { buildCommand } from "../lib/commands";

export type RunOptions = {
  boxId: string;
  commandName: string;
  args?: string[];
  copyCommand: boolean;
};

export async function run(options: RunOptions) {
  const { boxId, commandName, copyCommand: copy, args } = options;

  //  Find the command from our configuration.
  const boxesConfig = await getConfiguration();
  const boxConfig = boxesConfig?.boxes?.[boxId];
  const commandConfiguration =
    boxConfig?.commands?.[commandName] || boxesConfig?.commands?.[commandName];
  if (!commandConfiguration) {
    throw new TerminatingWarning(
      `Unable to find command configuration for '${commandName}'`,
    );
  }

  //  Now get the boxes.
  const boxes = await getBoxes();
  const box = boxes.find((b) => b.boxId === boxId);
  if (!box) {
    throw new TerminatingWarning(`Unable to find box with id '${boxId}'`);
  }

  //  Build the command and copy command.
  const { command, copyCommand } = buildCommand(
    commandConfiguration,
    box.instance,
    args,
  );

  //  If the user has requested to copy the command, copy it now.
  //  Do not copy to the clipboard in jest as it seems to fail:
  //  https://github.com/jestjs/jest/issues/11438
  if (copy && process.env.JEST_WORKER_ID === undefined) {
    const clipboard = (await import("clipboardy")).default;
    clipboard.writeSync(copyCommand || "");
  }

  return { command, copyCommand };
}
