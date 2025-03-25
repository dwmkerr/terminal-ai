import { ProviderConfiguration } from "../configuration/configuration";
import { getProviderPrompt } from "./get-provider-prompt";

describe("providers", () => {
  describe("get-provider-prompt", () => {
    it("should return 'chatgpt' for the root provider", () => {
      const provider: ProviderConfiguration = {
        name: "", // i.e. root
        apiKey: "key",
        baseURL: "url",
        model: "model",
      };
      expect(getProviderPrompt(provider)).toBe("chatgpt");
    });

    it("should return the provider name if one is specified and no prompt is configured", () => {
      const provider: ProviderConfiguration = {
        name: "gemini",
        apiKey: "key",
        baseURL: "url",
        model: "model",
        prompt: undefined,
      };
      expect(getProviderPrompt(provider)).toBe("gemini");
    });

    it("should return the prompt if one is specified", () => {
      const provider: ProviderConfiguration = {
        name: "gemini",
        apiKey: "key",
        baseURL: "url",
        model: "model",
        prompt: "my-gemini",
      };
      expect(getProviderPrompt(provider)).toBe("my-gemini");
    });
  });
});
