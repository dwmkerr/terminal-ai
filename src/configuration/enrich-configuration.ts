import {
  Configuration,
  DeepPartial,
  getDefaultConfigurationLangfuseIntegration,
} from "./configuration";

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
  enrichProperty(newConfig, "apiKey", data.apiKey);
  enrichProperty(newConfig, "model", data.model);
  enrichProperty(newConfig, "baseURL", data.baseURL);

  //  Provider configuration.
  enrichProperty(newConfig, "provider", data.provider);
  enrichProperty(newConfig, "providers", data.providers);

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
