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
        //  fields, so we have no provider type.
        name: "",
        //  But as per the docs, the root provider is assumed to be openai.
        type: "openai",
      };
      expect(provider).toStrictEqual(expected);
    });

    it("throws if an invalid provider name is specified", async () => {
      const config: Configuration = {
        ...getDefaultConfiguration(),
        //  Set a provider name that doesn't match a provider...
        provider: "openai",
        //  Make sure we have no providers...
        providers: {
          gemini: {
            name: "gemini",
            model: "",
            baseURL: "",
            apiKey: "",
          },
        },
      };
      const call = () => buildProviderFromConfig(config);
      expect(call).toThrow(/'openai' not found in configured 'providers'/);
    });
  });
});
