import fs from "fs";
import yaml, { YAMLException } from "js-yaml";
import { translateError } from "../lib/translate-error";
import { Configuration, DeepPartial } from "./configuration";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export function loadConfigurationFromFile(
  path: string,
): DeepPartial<Configuration> {
  //  If the file is missing, we're done.
  if (!fs.existsSync(path)) {
    return {};
  }

  //  Load the configuration structure.
  try {
    const fileContents = fs.readFileSync(path, "utf8");
    return loadConfigurationFromFileContents(fileContents);
  } catch (err) {
    throw translateError(err);
  }
}

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

    //  Any providers we have loaded will need to have their 'name' field set
    //  as the key of the provider in the array, e.g:
    //  providers:
    //    gemini:
    //      name: "<--- this is set from the key 'gemini' above"
    const providers = config.providers;
    if (providers !== undefined) {
      const providerKeys = Object.keys(providers);
      for (const key of providerKeys) {
        if (providers[key] !== undefined) {
          providers[key].name = key;
        }
      }
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
