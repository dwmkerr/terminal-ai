import fs from "fs";
import path from "path";
import debug from "debug";
import yaml from "js-yaml";
import { ErrorCode, TerminalAIError } from "../lib/errors";
import { enrichProperty } from "./enrich-configuration";

const dbg = debug("ai:configuration");

export function updateConfigurationFile(
  configFilePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>,
) {
  try {
    //  Ensure the config directory exists.
    // Check if the directory exists
    const configFileFolder = path.dirname(configFilePath);
    if (!fs.existsSync(configFileFolder)) {
      dbg(`creating config file folder '${configFileFolder}'...`);
      fs.mkdirSync(configFileFolder, { recursive: true });
    }

    //  We might be updating an existing file, if so get its contents.
    const fileContents = fs.existsSync(configFilePath)
      ? fs.readFileSync(configFilePath, "utf8")
      : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yamlData = (yaml.load(fileContents) as Record<string, any>) || {};
    const fieldPaths = Object.keys(updates);
    for (const fieldPath of fieldPaths) {
      enrichProperty(yamlData, fieldPath, updates[fieldPath]);
    }
    const updatedYaml = yaml.dump(yamlData, { indent: 2 });
    fs.writeFileSync(configFilePath, updatedYaml, "utf8");
  } catch (err) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      `error updating config file ${configFilePath}: ${err}`,
      err as Error,
    );
  }
}
