import { getDefaultConfiguration } from "../configuration/configuration";
import { buildProviderFromConfig } from "./build-provider";
import { isFirstRun } from "./is-first-run";

describe("execution-context", () => {
  describe("isFirstRun", () => {
    it("should identify default config as first run", () => {
      const config = getDefaultConfiguration();
      const provider = buildProviderFromConfig(config);
      expect(isFirstRun(provider)).toBe(true);
    });

    it("should assume first run if a baseurl has been unset", () => {
      const config = {
        ...getDefaultConfiguration(),
        apiKey: "key", // we've set a key...
        baseURL: "", // ...but unset the baseurl (maybe by env var etc).
      };
      const provider = buildProviderFromConfig(config);
      expect(isFirstRun(provider)).toBe(true);
    });

    it("should not assume first run if a named provider is configured", () => {
      const config = {
        ...getDefaultConfiguration(),
        //  be very explicit - no api key...
        apiKey: "",
        //  ...but a named provider
        provider: "openai",
        providers: {
          openai: {
            name: "openai",
            providerId: "openai",
            apiKey: "key",
            baseURL: "url",
            model: "url",
          },
        },
      };
      const provider = buildProviderFromConfig(config);
      expect(isFirstRun(provider)).toBe(false);
    });
  });
});
