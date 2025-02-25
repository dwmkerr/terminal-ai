import * as fs from "fs";
import * as path from "path";
import { confirm } from "@inquirer/prompts";

function mkdirRecursive(dir: string): void {
  if (!fs.existsSync(dir)) {
    mkdirRecursive(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

export async function saveAs(
  filePath: string,
  content: string,
  interactive: boolean,
): Promise<boolean> {
  //  Create the absolute path and ensure the required folders exist.
  const absolutePath = path.resolve(filePath);
  const name = path.basename(filePath);
  mkdirRecursive(path.dirname(absolutePath));

  //  If the destination file exists throw unless we can ask to overwrite.
  if (fs.existsSync(absolutePath)) {
    if (!interactive) {
      throw new Error(
        `File ${absolutePath} exists and interactive mode is off.`,
      );
    }

    //  Ask whether the user will overwrite.
    const overwrite = await confirm({
      message: `${name} exists - overwrite?`,
      default: false,
    });
    if (!overwrite) {
      return false;
    }
  }

  //  Write the file.
  fs.writeFileSync(absolutePath, content, "utf8");
  return true;
}
