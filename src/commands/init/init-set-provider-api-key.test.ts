import { createProviderConfig } from "./init-set-provider-api-key";

describe("init", () => {
  describe("createProviderConfig", () => {
    test("creates correct openai config", () => {
      const provider = createProviderConfig("openai", "key");
      expect(provider).toStrictEqual({
        apiKey: "key",
        providerId: "openai",
        name: "openai",
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
      });
    });
    test("creates correct gemini config", () => {
      const provider = createProviderConfig("gemini", "gkey");
      expect(provider).toStrictEqual({
        apiKey: "gkey",
        providerId: "gemini",
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/",
        model: "models/gemini-2.0-flash",
      });
    });
    test("throws on unknown provider id", () => {
      expect(() => createProviderConfig("whatever", "key")).toThrow(
        /unknown provider 'whatever'/,
      );
    });
  });
});
