import { ProviderType } from "../providers/provider-type";

export const ConfigurationPaths = {
  ConfigFolder: ".ai",
  ConfigFile: `config.yaml`,
  PromptsFolder: "prompts",
  ChatPromptsContextFolder: "chat/context",
  CodePromptsOutputFolder: "code/output",
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface LangfuseIntegrationConfiguration {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  //  Note: many other options for langfuse beyond this:
  //  https://langfuse.com/docs/sdk/typescript/guide#trace
  traceName: string;
}

export interface ProviderConfiguration {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
  //  This can be used to cross reference against providers in:
  //  https://github.com/dwmkerr/ai-providers-and-models
  //  It is not required, but if set allows us to do slightly better model
  //  validation for the user.
  type?: ProviderType;
  //  Optional prompt override.
  prompt?: string;
}

export interface Configuration {
  apiKey: string;
  baseURL: string;
  model: string;

  //  The provider name (optional, but when set must be valid) and the providers.
  provider?: string;
  providers: Record<string, ProviderConfiguration>;

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
    providers: {},
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
