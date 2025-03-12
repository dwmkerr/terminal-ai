import fs from "fs";
import os from "os";
import path from "path";
import yaml from "js-yaml";
import dbg from "debug";

import { TerminatingError, TerminatingWarning } from "../lib/errors";

const debug = dbg("ai:configuration");

export interface Configuration {
  openAiApiKey: string;
  openai: {
    baseURL: string;
    //  If a new model comes out, we want users to be able to enter it in their
    //  config. We'll try and validate with 'ai check'.
    model: string;
  };
  prompts: {
    chat: {
      context: string[];
    };
    code: {
      output: string[];
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

export function getDefaultConfiguration(): Configuration {
  return {
    openAiApiKey: "",
    openai: {
      baseURL: "https://api.openai.com/v1/",
      model: "gpt-3.5-turbo",
    },
    prompts: {
      chat: {
        context: [],
      },
      code: {
        output: [],
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
    const contents = yaml.load(fileContents) as DeepPartial<Configuration>;
    return contents;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    //  Re-throw our own specific errors.
    if (error instanceof TerminatingError) {
      throw error;
    }
    throw new TerminatingError(`error reading config file: ${path}`);
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

export function enrichConfiguration(
  config: Configuration,
  data: DeepPartial<Configuration>,
): Configuration {
  const newConfig = { ...config };
  if (data.openAiApiKey !== undefined) {
    newConfig.openAiApiKey = data.openAiApiKey;
  }
  if (data?.openai?.model !== undefined) {
    newConfig.openai.model = data.openai.model;
  }
  if (data?.openai?.baseURL !== undefined) {
    newConfig.openai.baseURL = data.openai.baseURL;
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
  if (data?.prompts?.code?.output !== undefined) {
    const prompts = data.prompts.code.output.filter((p) => p !== undefined);
    newConfig.prompts.code.output.push(...prompts);
  }
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
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TerminatingWarning(
      `Error updating config file ${configPath}: ${error.message}`,
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
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TerminatingWarning(
      `Error updating config file ${configPath}: ${error.message}`,
    );
  }
}
