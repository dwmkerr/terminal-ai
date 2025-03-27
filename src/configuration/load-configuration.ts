import dbg from "debug";
import { Configuration, getDefaultConfiguration } from "./configuration";
import { loadConfigationFromPromptsFolder } from "./configuration-prompts-folder";
import { loadConfigurationFromEnv } from "./configuration-env";
import { loadConfigurationFromFile } from "./configuration-file";
import { enrichConfiguration, enrichProperty } from "./enrich-configuration";
import { validateConfiguration } from "./validate-configuration";

const debug = dbg("ai:configuration");

export async function loadConfiguration(
  promptsFolder: string,
  configFilePath: string,
  env: NodeJS.ProcessEnv,
): Promise<Configuration> {
  const defaultConfig = getDefaultConfiguration();
  const promptsConfig = loadConfigationFromPromptsFolder(promptsFolder);
  const fileConfig = loadConfigurationFromFile(configFilePath);
  const envConfig = loadConfigurationFromEnv(env);

  debug("composing configuration:");
  debug("  default config:", defaultConfig);
  debug("  prompts config:", promptsConfig);
  debug("  file config   :", fileConfig);
  debug("  env config    :", envConfig);

  const config1 = enrichConfiguration(defaultConfig, promptsConfig);
  const config2 = enrichConfiguration(config1, fileConfig);
  const config3 = enrichConfiguration(config2, envConfig);

  //  Before we try to manipulate any configuration, validate.
  validateConfiguration(config3);

  //  This is probably not the ideal space, but if we have a named provider, we
  //  will override its config with the AI_* provider env vars (otherwise only
  //  the root provider is updated).
  const namedProvider = config3.provider && config3.providers[config3.provider];
  if (namedProvider) {
    const name = namedProvider.name;
    enrichProperty(config3, `providers.${name}.apiKey`, env["AI_API_KEY"]);
    enrichProperty(config3, `providers.${name}.baseURL`, env["AI_BASE_URL"]);
    enrichProperty(config3, `providers.${name}.model`, env["AI_MODEL"]);
  }

  debug("  final config  :", config3);

  return config3;
}
