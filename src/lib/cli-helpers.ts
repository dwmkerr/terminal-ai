import util from "util";
import child_process from "child_process";
import colors from "colors/safe";

const exec = util.promisify(child_process.exec);

export async function execCommand(command: string, interactive: boolean) {
  const { stdout, stderr } = await exec(command);
  //  Safe for us to use color, we're interactive.
  if (stderr) {
    console.log(interactive ? colors.red(stderr) : stderr);
  }
  if (stdout) {
    console.log(interactive ? colors.white(stdout) : stdout);
  }
}
