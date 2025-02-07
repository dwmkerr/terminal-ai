import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import dbg from "debug";
import { input } from "@inquirer/prompts";

import { ExecutionContext } from "../lib/execution-context";
import { TerminatingWarning } from "../lib/errors";
import {
  Configuration,
  getChatPromptsPath,
  getConfigPath,
} from "../configuration/configuration";

const debug = dbg("ai:ensure-api-key");

async function ensurePromptsExist() {
  //  Ensure the prompts/chat folder exists.
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

export async function ensureApiKey(
  executionContext: ExecutionContext,
  config: Configuration,
): Promise<Configuration> {
  // This will run when no command is specified
  if (!executionContext.isInteractive) {
    throw new TerminatingWarning(
      "Ensure API Key is not supported in non-interactive mode",
    );
  }

  //  TODO we need to move this around, but for now is OK.
  await ensurePromptsExist();

  //  If we already have a key, we're done.
  if (config.openAiApiKey !== "") {
    debug("key already configured");
    return config;
  }

  //  If we don't have an API key, ask for one.
  console.log(
    `An API key must be configured so that Terminal AI can talk to ChatGPT.
Enter your key below, or for instructions check:
  https://github.com/dwmkerr/terminal-ai#api-key
`,
  );
  const apiKey = await input({ message: "API Key:" });

  //  Update the config file.
  const configPath = getConfigPath();
  try {
    const fileContents = fs.readFileSync(configPath, "utf8");
    const yamlData = yaml.load(fileContents) as Record<string, unknown>;
    yamlData["openAiApiKey"] = apiKey;
    const updatedYaml = yaml.dump(yamlData, { indent: 2 });
    fs.writeFileSync(configPath, updatedYaml, "utf8");
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TerminatingWarning(
      `Error updating config file ${configPath}: ${error.message}`,
    );
  }

  //  Return the enriched configuration.
  debug("key read and saved");
  return {
    ...config,
    openAiApiKey: apiKey,
  };
}
