export interface LangfuseIntegrationConfiguration {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  //  Note: many other options for langfuse beyond this:
  //  https://langfuse.com/docs/sdk/typescript/guide#trace
  traceName: string;
}

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
