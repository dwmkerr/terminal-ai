import yaml from "js-yaml";
import { translateError } from "../lib/translate-error";
import { Configuration } from "./configuration";
import { DeepPartial } from "./utils";

export function loadConfigurationFromFileContents(
  contents: string,
): DeepPartial<Configuration> {
  try {
    const config = yaml.load(contents) as DeepPartial<Configuration>;
    return config;
  } catch (err) {
    throw translateError(err);
  }
}
