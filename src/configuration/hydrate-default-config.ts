import fs from "fs";
import path from "path";
import dbg from "debug";
import { promptFolders } from "./utils";

const debug = dbg("ai:configuration");

export function hydrateFolder(target: string, source: string): void {
  const targetFolderExists = fs.existsSync(target);
  debug(
    `target folder: '${target}' ${targetFolderExists ? "exists" : "doesn't exist -> creating..."}`,
  );
  if (!targetFolderExists) {
    fs.mkdirSync(target, { recursive: true });
  }

  //  Copy all files from source folder to destination folder.
  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const sourceFile = path.join(source, file);
    const destFile = path.join(target, file);
    const exists = fs.existsSync(destFile);
    debug(
      `checking file ${destFile}... ${exists ? "exists" : "doesn't exist -> copying..."}`,
    );
    if (exists) return;

    try {
      fs.copyFileSync(sourceFile, destFile);
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (err) {
      console.error(`Error copying ${file}: ${err}`);
    }
  });
}

export function hydrateDefaultConfig() {
  //  Ensure the prompts/chat folder exists.
  debug("hydrating default config...");
  const folders = promptFolders();
  hydrateFolder(folders.chatPrompts.dest, folders.chatPrompts.src);
  hydrateFolder(folders.codePrompts.dest, folders.codePrompts.src);
}
