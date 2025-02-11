import fs from "fs";
import path from "path";
import dbg from "debug";

import { promptFolders } from "../configuration/configuration";

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
  hydrateFolder(promptFolders.chatPrompts.dest, promptFolders.chatPrompts.src);
  hydrateFolder(promptFolders.codePrompts.dest, promptFolders.codePrompts.src);
}
