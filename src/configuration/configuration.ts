import fs from "fs";
import os from "os";
import path from "path";
import yaml from "js-yaml";

import { TerminatingWarning } from "../lib/errors";

export interface Configuration {
  openAiApiKey: string;
  prompts: {
    chat: {
      context: string[];
    };
  };
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

export const configDir = ".ai";
export const configFilePath = `${configDir}/config.yaml`;
export const chatPromptsPath = `${configDir}/prompts/chat/context`;

export function getConfigPath(): string {
  return path.join(os.homedir(), configFilePath);
}

export function getChatPromptsPath(): string {
  return path.join(os.homedir(), chatPromptsPath);
}

export function getDefaultConfiguration(): Configuration {
  return {
    openAiApiKey: "",
    prompts: {
      chat: {
        context: [],
      },
    },
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

export function getConfigurationFromPromptsFolder(
  folder: string,
): DeepPartial<Configuration> {
  //  Load the chat prompts.
  if (!fs.existsSync(folder)) {
    return {};
  }
  const promptPaths = fs.readdirSync(folder);
  const contextPrompts = promptPaths.map((promptPath) => {
    const filePath = path.join(folder, promptPath);
    return fs.readFileSync(filePath, "utf8");
  });
  return {
    prompts: {
      chat: {
        context: contextPrompts,
      },
    },
  };
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
  if (data?.prompts?.chat?.context !== undefined) {
    const prompts = data.prompts.chat.context.filter((p) => p !== undefined);
    newConfig.prompts.chat.context.push(...prompts);
  }
  return newConfig;
}

export async function getConfiguration(): Promise<Configuration> {
  const defaultConfig = getDefaultConfiguration();
  const promptsConfig = getConfigurationFromPromptsFolder(getChatPromptsPath());
  const fileConfig = getConfigurationFromFile(getConfigPath());
  const envConfig = getConfigurationFromEnv(process.env);

  const config1 = enrichConfiguration(defaultConfig, promptsConfig);
  const config2 = enrichConfiguration(config1, fileConfig);
  const config3 = enrichConfiguration(config2, envConfig);

  return config3;
}

//  Update the config file.
export function saveApiKey(apiKey: string) {
  const configPath = getConfigPath();
  try {
    //  Ensure the config directory exists.
    // Check if the directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    //  We might be updating an existing file, if so get its contents.

    const fileContents = fs.existsSync(configPath)
      ? fs.readFileSync(configPath, "utf8")
      : "";
    const yamlData = (yaml.load(fileContents) as Record<string, unknown>) || {};
    yamlData["openAiApiKey"] = apiKey;
    const updatedYaml = yaml.dump(yamlData, { indent: 2 });
    fs.writeFileSync(configPath, updatedYaml, "utf8");
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TerminatingWarning(
      `Error updating config file ${configPath}: ${error.message}`,
    );
  }
}
