import fs from "fs";
import os from "os";
import path from "path";
import yaml from "js-yaml";
import dbg from "debug";

import { ErrorCode, TerminalAIError } from "../lib/errors";
import {
  Configuration,
  getDefaultConfiguration,
  getDefaultConfigurationLangfuseIntegration,
} from "./configuration";

const debug = dbg("ai:configuration");

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const configDir = ".ai";
export const configFilePath = `${configDir}/config.yaml`;
export const chatPromptsPath = `${configDir}/prompts/chat/context`;
export const codeOutputPromptsPath = `${configDir}/prompts/code/output`;

export function promptFolders() {
  //  Build the path to the 'src' folder.
  const __project_dir = path.resolve(__dirname, "../..");

  return {
    chatPrompts: {
      src: path.join(__project_dir, `./prompts/chat/context`),
      dest: path.join(os.homedir(), `${configDir}/prompts/chat/context`),
    },
    codePrompts: {
      src: path.join(__project_dir, `./prompts/code/output`),
      dest: path.join(os.homedir(), `${configDir}/prompts/code/output`),
    },
  };
}

export function getConfigPath(): string {
  return path.join(os.homedir(), configFilePath);
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
    const contents = yaml.load(fileContents) as DeepPartial<Configuration>;
    return contents;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      `check config file: ${path}`,
    );
  }
}

export function getConfigurationFromEnv(
  env: NodeJS.ProcessEnv,
): DeepPartial<Configuration> {
  const newConfig: DeepPartial<Configuration> = {};
  if (env.AI_OPENAI_API_KEY !== undefined) {
    newConfig.openAiApiKey = env.AI_OPENAI_API_KEY;
  }
  if (env.AI_OPENAI_MODEL !== undefined) {
    if (newConfig.openai === undefined) {
      newConfig.openai = {};
    }
    newConfig.openai.model = env.AI_OPENAI_MODEL;
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
  chatContextPromptsFolder: string,
  codeOutputPromptsFolder: string,
): DeepPartial<Configuration> {
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

  return {
    prompts: {
      chat: {
        context: loadPrompts(chatContextPromptsFolder),
      },
      code: {
        output: loadPrompts(codeOutputPromptsFolder),
      },
    },
  };
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function enrichProperty<T extends Record<string, any>>(
  obj: T,
  path: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value: any,
): void {
  if (value === undefined) {
    return;
  }
  const keys = path.split(".");
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  let current: any = obj;

  while (keys.length > 1) {
    const key = keys.shift()!;
    if (!(key in current)) current[key] = {};
    current = current[key];
  }

  current[keys[0]] = value;
}

export function enrichConfiguration(
  config: Configuration,
  data: DeepPartial<Configuration>,
): Configuration {
  const newConfig = { ...config };

  //  OpenAI configuration.
  enrichProperty(newConfig, "openAiApiKey", data.openAiApiKey);
  enrichProperty(newConfig, "openai.model", data.openai?.model);
  enrichProperty(newConfig, "openai.baseURL", data.openai?.baseURL);

  //  Prompt configuration.
  if (data?.prompts?.chat?.context !== undefined) {
    const prompts = data.prompts.chat.context.filter((p) => p !== undefined);
    newConfig.prompts.chat.context.push(...prompts);
  }
  if (data?.prompts?.code?.output !== undefined) {
    const prompts = data.prompts.code.output.filter((p) => p !== undefined);
    newConfig.prompts.code.output.push(...prompts);
  }

  //  Langfuse configuration.
  if (data?.integrations?.langfuse !== undefined) {
    const lf = data.integrations.langfuse;
    if (!newConfig.integrations.langfuse) {
      newConfig.integrations.langfuse =
        getDefaultConfigurationLangfuseIntegration();
    }
    enrichProperty(newConfig, "integrations.langfuse.secretKey", lf.secretKey);
    enrichProperty(newConfig, "integrations.langfuse.publicKey", lf.publicKey);
    enrichProperty(newConfig, "integrations.langfuse.baseUrl", lf.baseUrl);
    enrichProperty(newConfig, "integrations.langfuse.traceName", lf.traceName);
  }

  //  Debug configuration.
  enrichProperty(newConfig, "debug.enable", data.debug?.enable);
  enrichProperty(newConfig, "debug.namespace", data.debug?.namespace);
  return newConfig;
}

export async function getConfiguration(): Promise<Configuration> {
  const defaultConfig = getDefaultConfiguration();
  const folders = promptFolders();
  const promptsConfig = getConfigurationFromPromptsFolder(
    folders.chatPrompts.src,
    folders.codePrompts.src,
  );
  const fileConfig = getConfigurationFromFile(getConfigPath());
  const envConfig = getConfigurationFromEnv(process.env);

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
  } catch (err) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      `error updating config file ${configPath}: ${err}`,
      err as Error,
    );
  }
}

//  Update the config file. Needs to be extracted later on into a function
//  that takes a partial.
export function saveModel(model: string) {
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
    if (yamlData.openai === undefined) {
      yamlData.openai = {
        model,
      };
    } else {
      (yamlData.openai as Record<string, string>)["model"] = model;
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
