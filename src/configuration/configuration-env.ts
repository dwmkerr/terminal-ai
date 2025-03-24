import { Configuration, DeepPartial } from "./configuration";
import { enrichProperty } from "./enrich-configuration";

export function loadConfigurationFromEnv(
  env: NodeJS.ProcessEnv,
): DeepPartial<Configuration> {
  const newConfig: DeepPartial<Configuration> = {};

  //  Basic provider config.
  enrichProperty(newConfig, "apiKey", env["AI_API_KEY"]);
  enrichProperty(newConfig, "baseURL", env["AI_BASE_URL"]);
  enrichProperty(newConfig, "model", env["AI_MODEL"]);

  //  Debug config.
  const debugEnable = env["AI_DEBUG_ENABLE"] === "1" ? true : undefined;
  enrichProperty(newConfig, "debug.enable", debugEnable);
  enrichProperty(newConfig, "debug.namespace", env["AI_DEBUG_NAMESPACE"]);

  return newConfig;
}
