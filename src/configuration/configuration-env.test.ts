import { loadConfigurationFromEnv } from "./configuration-env";

describe("configuration", () => {
  describe("configuration-env", () => {
    test("can load empty env", () => {
      const env: NodeJS.ProcessEnv = {};
      expect(() => loadConfigurationFromEnv(env)).not.toThrow();
    });

    test("will not add unspecified fields", () => {
      //  Fields in the env that we don't manage should be ignored.
      const env: NodeJS.ProcessEnv = {
        sensitive: "value",
      };
      const config = loadConfigurationFromEnv(env);
      expect(config).toStrictEqual({});
    });

    test("can load basic provider configuration", () => {
      //  Basic provider config should work.
      const env: NodeJS.ProcessEnv = {
        AI_API_KEY: "secret",
        AI_BASE_URL: "url",
        AI_MODEL: "gpt4.5",
      };
      const config = loadConfigurationFromEnv(env);
      expect(config).toStrictEqual({
        apiKey: "secret",
        baseURL: "url",
        model: "gpt4.5",
      });
    });

    test("can load debug configuration", () => {
      //  Basic provider config should work.
      const config = loadConfigurationFromEnv({
        AI_DEBUG_ENABLE: "1",
        AI_DEBUG_NAMESPACE: "ai:conf*",
      });
      expect(config).toStrictEqual({
        debug: {
          enable: true,
          namespace: "ai:conf*",
        },
      });

      //  Extra check - AI_DEBUG_ENABLE MUST be "1" for us to set it. Truthy
      //  isn't enough.
      expect(
        loadConfigurationFromEnv({
          AI_DEBUG_ENABLE: "true",
        }),
      ).toStrictEqual({});
    });
  });
});
