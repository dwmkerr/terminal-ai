import { Configuration, getDefaultConfiguration } from "./configuration";
import { DeepPartial, enrichConfiguration, enrichProperty } from "./utils";

describe("configuration", () => {
  describe("utils", () => {
    describe("enrichProperty", () => {
      test("can enrich a deeply nested property", () => {
        //  Create default config - assert that it has no langfuse integration.
        const config = getDefaultConfiguration();
        expect(config.integrations.langfuse).toBeUndefined();

        //  Deeply set some values.
        enrichProperty(config, "integrations.langfuse.traceName", "tracename");
        expect(config.integrations.langfuse?.traceName).toBe("tracename");
      });
    });

    describe("enrichConfiguration", () => {
      test("correctly enriches default configuration with partial configuration", () => {
        const config = getDefaultConfiguration();
        const partial: DeepPartial<Configuration> = {
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
          prompts: {
            chat: {
              context: [],
            },
            code: {
              output: [],
            },
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
    });
  });
});
