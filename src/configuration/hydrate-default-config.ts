import fs from "fs";
import path from "path";
import dbg from "debug";

import { getChatPromptsPath } from "../configuration/configuration";

const debug = dbg("ai:configuration");

export function hydrateDefaultConfig() {
  //  Ensure the prompts/chat folder exists.
  debug("hydrating default config...");
  debug("checking local prompts...");
  const sourceFolder = path.join(".", "prompts", "chat", "context");
  const destFolder = getChatPromptsPath();
  const promptsExists = fs.existsSync(destFolder);
  debug(
    `checking local prompts... ${promptsExists ? "exists" : "doesn't exist -> creating..."}`,
  );
  if (!promptsExists) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  // Copy all files from source folder to destination folder
  const files = fs.readdirSync(sourceFolder);
  files.forEach((file) => {
    const sourceFile = path.join(sourceFolder, file);
    const destFile = path.join(destFolder, file);
    const exists = fs.existsSync(destFile);
    debug(
      `checking prompt ${destFile}... ${exists ? "exists" : "doesn't exist -> copying..."}`,
    );
    if (exists) return;

    fs.copyFile(sourceFile, destFile, (err) => {
      if (err) {
        console.error(`Error copying ${file}: ${err.message}`);
      }
    });
  });
}
