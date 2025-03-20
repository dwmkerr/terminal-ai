import yaml, { YAMLException } from "js-yaml";
import { translateError } from "../lib/translate-error";
import { Configuration } from "./configuration";
import { DeepPartial } from "./utils";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export function loadConfigurationFromFileContents(
  contents: string,
): DeepPartial<Configuration> {
  try {
    const config = (yaml.load(contents) as DeepPartial<Configuration>) || {};

    //  Mapping: <=0.11 -> 0.12
    //  - openAiApiKey   -> apiKey
    //  - openai.baseURL -> baseURL
    //  - openai.model   -> model
    if ("openAiApiKey" in config) {
      config.apiKey = `${config["openAiApiKey"]}`;
      delete config.openAiApiKey;
    }
    if ("openai" in config) {
      config.baseURL = (config["openai"] as Record<string, string>)["baseURL"];
      config.model = (config["openai"] as Record<string, string>)["model"];
      delete config.openai;
    }

    return config;
  } catch (err) {
    //  If we have a YAML error we can be specific on the issues.
    const yamlErr = err as YAMLException;
    if (yamlErr) {
      throw new TerminalAIError(
        ErrorCode.InvalidConfiguration,
        `YAML Error in config file: ${yamlErr.message}`,
      );
    }
    throw translateError(err);
  }
}
