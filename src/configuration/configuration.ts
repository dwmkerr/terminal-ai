export const ConfigurationPaths = {
  configDir: ".ai",
  configFilePath: `.ai/config.yaml`,
  chatPromptsPath: `.ai/prompts/chat/context`,
  codeOutputPromptsPath: `.ai/prompts/code/output`,
};

export interface LangfuseIntegrationConfiguration {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  //  Note: many other options for langfuse beyond this:
  //  https://langfuse.com/docs/sdk/typescript/guide#trace
  traceName: string;
}

export interface Configuration {
  apiKey: string;
  baseURL: string;
  model: string;
  prompts: {
    chat: {
      context: string[];
    };
    code: {
      output: string[];
    };
  };
  integrations: {
    langfuse?: LangfuseIntegrationConfiguration;
  };
  debug: {
    enable: boolean;
    namespace: string;
  };
}

export function getDefaultConfiguration(): Configuration {
  return {
    apiKey: "",
    baseURL: "https://api.openai.com/v1/",
    model: "gpt-3.5-turbo",
    prompts: {
      chat: {
        context: [],
      },
      code: {
        output: [],
      },
    },
    integrations: {},
    debug: {
      enable: false,
      namespace: "ai*",
    },
  };
}

export function getDefaultConfigurationLangfuseIntegration(): LangfuseIntegrationConfiguration {
  return {
    secretKey: "",
    publicKey: "",
    baseUrl: "https://cloud.langfuse.com",
    traceName: "terminal-ai",
  };
}
