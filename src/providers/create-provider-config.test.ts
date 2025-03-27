import { createProviderConfig } from "./create-provider-config";
import { ProviderType } from "./provider-type";

describe("providers", () => {
  describe("createProviderConfig", () => {
    it("creates correct openai config", () => {
      const provider = createProviderConfig("openai", "key");
      expect(provider).toStrictEqual({
        apiKey: "key",
        type: "openai",
        name: "openai",
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
      });
    });

    it("creates correct gemini config", () => {
      const provider = createProviderConfig("gemini_openai", "gkey");
      expect(provider).toStrictEqual({
        apiKey: "gkey",
        type: "gemini_openai",
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        model: "models/gemini-2.0-flash",
      });
    });

    it("throws on unknown provider type", () => {
      expect(() =>
        createProviderConfig("whatever" as ProviderType, "key"),
      ).toThrow(/unknown provider type 'whatever'/);
    });
  });
});
