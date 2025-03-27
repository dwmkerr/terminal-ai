import fs from "fs";
import path from "path";
import dbg from "debug";
import {
  Configuration,
  ConfigurationPaths,
  DeepPartial,
} from "./configuration";

const debug = dbg("ai:configuration");

export function loadConfigationFromPromptsFolder(
  promptsFolder: string,
): DeepPartial<Configuration> {
  //  Get the paths to the prompts folder, based on the source direction (i.e.
  //  installed or running `ai` program, and the target directory (i.e. the
  //  deployed `~/.ai/config` folder.
  const loadPrompts = (folder: string): string[] => {
    if (!fs.existsSync(folder)) {
      return [];
    }
    const promptPaths = fs.readdirSync(folder);
    const prompts = promptPaths.map((promptPath) => {
      const filePath = path.join(folder, promptPath);
      return fs.readFileSync(filePath, "utf8");
    });
    return prompts;
  };
  const chatPromptsFolder = path.join(
    promptsFolder,
    ConfigurationPaths.ChatPromptsContextFolder,
  );
  const codePromptsFolder = path.join(
    promptsFolder,
    ConfigurationPaths.CodePromptsOutputFolder,
  );

  debug(`loading chat prompts from: ${chatPromptsFolder}`);
  debug(`loading code prompts from: ${codePromptsFolder}`);

  return {
    prompts: {
      chat: {
        context: loadPrompts(chatPromptsFolder),
      },
      code: {
        output: loadPrompts(codePromptsFolder),
      },
    },
  };
}

export function hydrateFolder(source: string, target: string): void {
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

export function hydratePromptsFolder(
  sourceFolder: string,
  destinationFolder: string,
) {
  //  Ensure the prompts/chat folder exists.
  debug(
    `hydrating prompts from '${sourceFolder}' to '${destinationFolder}'...`,
  );

  //  Hydrate our prompts folder from a source (which'll be the project root
  //  prompts folder, whether deployed or whether running in jest).
  const chatSrc = path.join(
    sourceFolder,
    ConfigurationPaths.ChatPromptsContextFolder,
  );
  const chatDest = path.join(
    destinationFolder,
    ConfigurationPaths.ChatPromptsContextFolder,
  );
  const codeSrc = path.join(
    sourceFolder,
    ConfigurationPaths.CodePromptsOutputFolder,
  );
  const codeDest = path.join(
    destinationFolder,
    ConfigurationPaths.CodePromptsOutputFolder,
  );
  hydrateFolder(chatSrc, chatDest);
  hydrateFolder(codeSrc, codeDest);
}
