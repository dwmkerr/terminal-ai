import dbg from "debug";
import { Configuration, getDefaultConfiguration } from "./configuration";
import { loadConfigationFromPromptsFolder } from "./configuration-prompts-folder";
import { loadConfigurationFromEnv } from "./configuration-env";
import { loadConfigurationFromFile } from "./configuration-file";
import { enrichConfiguration } from "./enrich-configuration";

const debug = dbg("ai:configuration");

export async function loadConfiguration(
  configFilePath: string,
  promptsFolder: string,
): Promise<Configuration> {
  const defaultConfig = getDefaultConfiguration();
  const promptsConfig = loadConfigationFromPromptsFolder(promptsFolder);
  const fileConfig = loadConfigurationFromFile(configFilePath);
  const envConfig = loadConfigurationFromEnv(process.env);

  debug("composing configuration:");
  debug("  default config:", defaultConfig);
  debug("  prompts config:", promptsConfig);
  debug("  file config   :", fileConfig);
  debug("  env config    :", envConfig);

  const config1 = enrichConfiguration(defaultConfig, promptsConfig);
  const config2 = enrichConfiguration(config1, fileConfig);
  const config3 = enrichConfiguration(config2, envConfig);

  debug("  final config  :", config3);

  return config3;
}
