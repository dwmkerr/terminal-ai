import fs from "fs";
import yaml from "js-yaml";
import { ConfigurationPaths } from "./configuration";
import { enrichProperty, getConfigPath } from "./utils";
import { ErrorCode, TerminalAIError } from "../lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateConfigurationFile(updates: Record<string, any>) {
  const configPath = getConfigPath();
  try {
    //  Ensure the config directory exists.
    // Check if the directory exists
    if (!fs.existsSync(ConfigurationPaths.configDir)) {
      fs.mkdirSync(ConfigurationPaths.configDir);
    }

    //  We might be updating an existing file, if so get its contents.
    const fileContents = fs.existsSync(configPath)
      ? fs.readFileSync(configPath, "utf8")
      : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yamlData = (yaml.load(fileContents) as Record<string, any>) || {};
    const fieldPaths = Object.keys(updates);
    for (const fieldPath of fieldPaths) {
      enrichProperty(yamlData, fieldPath, updates[fieldPath]);
    }
    const updatedYaml = yaml.dump(yamlData, { indent: 2 });
    fs.writeFileSync(configPath, updatedYaml, "utf8");
  } catch (err) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      `error updating config file ${configPath}: ${err}`,
      err as Error,
    );
  }
}
