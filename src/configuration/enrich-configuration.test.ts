import {
  Configuration,
  DeepPartial,
  getDefaultConfiguration,
} from "./configuration";
import { enrichConfiguration, enrichProperty } from "./enrich-configuration";

describe("configuration", () => {
  describe("utils", () => {
    describe("enrichProperty", () => {
      it("can enrich a deeply nested property", () => {
        //  Create default config - assert that it has no langfuse integration.
        const config = getDefaultConfiguration();
        expect(config.integrations.langfuse).toBeUndefined();

        //  Deeply set some values.
        enrichProperty(config, "integrations.langfuse.traceName", "tracename");
        expect(config.integrations.langfuse?.traceName).toBe("tracename");
      });
    });

    describe("enrichConfiguration", () => {
      it("correctly enriches default configuration with partial configuration", () => {
        const config = getDefaultConfiguration();
        const partial: DeepPartial<Configuration> = {
          providers: {
            gemini: {
              name: "gemini",
              apiKey: "gkey",
              baseURL: "gurl",
              model: "gmodel",
              type: "gemini_openai",
            },
          },
          integrations: {
            langfuse: {
              secretKey: "sk",
              //  Note: no publicKey or baseUrl, the default config for baseUrl
              //  should be set during enrichment...
              traceName: "terminal-ai-test",
            },
          },
          debug: {
            enable: true,
          },
        };
        const enriched = enrichConfiguration(config, partial);
        const expected: Configuration = {
          apiKey: "",
          baseURL: "https://api.openai.com/v1/",
          model: "gpt-3.5-turbo",
          providers: {
            gemini: {
              name: "gemini",
              apiKey: "gkey",
              baseURL: "gurl",
              model: "gmodel",
              type: "gemini_openai",
            },
          },
          prompts: {
            chat: {
              context: [],
            },
            code: {
              output: [],
            },
          },
          ui: {
            showProviderAndModel: false,
          },
          integrations: {
            langfuse: {
              secretKey: "sk",
              publicKey: "",
              //  Note that our enrichment doesn't contain all of the fields,
              //  and for the ones which are not set the default should be used.
              baseUrl: "https://cloud.langfuse.com",
              //  Note that here we've overriden the default.
              traceName: "terminal-ai-test",
            },
          },
          debug: {
            enable: true,
            //  Note even though we set partial 'debug' without setting
            //  'namespace', the existing namespace should NOT be unset.
            namespace: "ai*",
          },
        };
        expect(enriched).toMatchObject(expected);
      });

      it("correctly applies the user's langfuse configuration over the default langfuse configuration", () => {
        const defaultConfig = getDefaultConfiguration();
        const userConfig: DeepPartial<Configuration> = {
          integrations: {
            langfuse: {
              secretKey: "lf-key",
              publicKey: "pk-key",
              //  note: no baseurl set!
            },
          },
        };
        const config = enrichConfiguration(defaultConfig, userConfig);
        expect(config).toStrictEqual({
          ...defaultConfig,
          integrations: {
            langfuse: {
              secretKey: "lf-key",
              publicKey: "pk-key",
              //  note: these have been set by the default config
              baseUrl: "https://cloud.langfuse.com",
              traceName: "terminal-ai",
            },
          },
        });
      });
    });
  });
});
