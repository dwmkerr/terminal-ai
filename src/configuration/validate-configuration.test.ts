import { validateConfiguration } from "./validate-configuration";
import { Configuration, getDefaultConfiguration } from "./configuration";

describe("configuration", () => {
  describe("validateConfiguration", () => {
    it("throws if a named provider does not exist", async () => {
      //  Write a config file - note that the name of the provider is invalid.
      const config: Configuration = {
        ...getDefaultConfiguration(),
        provider: "wrong",
        providers: {
          gemini: {
            name: "",
            type: "gemini_openai",
            apiKey: "",
            baseURL: "https://generativelanguage.googleapis.com/v1beta/",
            model: "models/gemini-2.0-flash",
          },
        },
      };

      //  Load the config, which should fail.
      const load = () => validateConfiguration(config);
      expect(load).toThrow(/provider 'wrong' not found in 'providers' block/);
    });
  });
});
