import {
  Configuration,
  getDefaultConfiguration,
  ProviderConfiguration,
} from "../configuration/configuration";
import { buildProviderFromConfig } from "./build-provider";

describe("execution-context", () => {
  describe("buildProviderFromConfig", () => {
    it("builds from the root provider configuration when no other providers are configured", async () => {
      const config: Configuration = {
        ...getDefaultConfiguration(),
        //  Make sure we have the minimum needed for a provider; an API key.
        apiKey: "key",
        //  Make sure we have no providers...
        providers: {},
      };
      const provider = buildProviderFromConfig(config);
      const expected: ProviderConfiguration = {
        //  This is what we get from the default config...
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
        //  This is what we provided...
        apiKey: "key",
        //  We're not configured from a provider block, just the root config
        //  fields, so we have no provider ID or name...
        providerId: undefined,
        name: "",
      };
      expect(provider).toStrictEqual(expected);
    });
  });
});
