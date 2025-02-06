import fs from "fs";
import os from "os";
import path from "path";
import yaml from "js-yaml";

import * as constants from "../lib/constants";
import { TerminatingWarning } from "../lib/errors";

export interface Configuration {
  openAiApiKey: string;
  debug: {
    enable: boolean;
    namespace: string;
  };
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function getDefaultConfiguration(): Configuration {
  return {
    openAiApiKey: "",
    debug: {
      enable: false,
      namespace: "ai*",
    },
  };
}

export function getConfigurationFromFile(
  path: string,
): DeepPartial<Configuration> {
  //  If the file is missing, we're done.
  if (!fs.existsSync(path)) {
    return {};
  }

  //  Load the configuration structure.
  try {
    const fileContents = fs.readFileSync(path, "utf8");
    return yaml.load(fileContents) as DeepPartial<Configuration>;
  } catch (error) {
    throw new TerminatingWarning(`error reading config file: ${path}`);
  }
}

export function enrichConfiguration(
  config: Configuration,
  data: DeepPartial<Configuration>,
): Configuration {
  const newConfig = { ...config };
  if (data.openAiApiKey !== undefined) {
    newConfig.openAiApiKey = data.openAiApiKey;
  }
  if (data?.debug?.enable !== undefined) {
    newConfig.debug.enable = data.debug.enable;
  }
  if (data?.debug?.namespace !== undefined) {
    newConfig.debug.namespace = data.debug.namespace;
  }
  return newConfig;
}

export function getConfigurationFromEnv(
  env: NodeJS.ProcessEnv,
): DeepPartial<Configuration> {
  const newConfig: DeepPartial<Configuration> = {};
  if (env.AI_OPENAI_API_KEY !== undefined) {
    newConfig.openAiApiKey = env.AI_OPENAI_API_KEY;
  }
  if (env.AI_DEBUG_ENABLE !== undefined) {
    if (newConfig.debug === undefined) {
      newConfig.debug = {};
    }
    newConfig.debug.enable = env.AI_DEBUG_ENABLE === "1";
  }
  if (env.AI_DEBUG_NAMESPACE !== undefined) {
    if (newConfig.debug === undefined) {
      newConfig.debug = {};
    }
    newConfig.debug.namespace = env.AI_DEBUG_NAMESPACE;
  }
  return newConfig;
}

export async function getConfiguration(): Promise<Configuration> {
  const configPath = path.join(os.homedir(), constants.configFilePath);

  const defaultConfig = getDefaultConfiguration();
  const fileConfig = getConfigurationFromFile(configPath);
  const envConfig = getConfigurationFromEnv(process.env);

  const config1 = enrichConfiguration(defaultConfig, fileConfig);
  const config2 = enrichConfiguration(config1, envConfig);

  return config2;
}
