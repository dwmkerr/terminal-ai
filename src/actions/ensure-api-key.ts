import fs from "fs";
import yaml from "js-yaml";
import dbg from "debug";
import { input } from "@inquirer/prompts";

import { ExecutionContext } from "../lib/execution-context";
import { TerminatingWarning } from "../lib/errors";
import { Configuration, getConfigPath } from "../configuration/configuration";

const debug = dbg("ai:ensure-api-key");

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
