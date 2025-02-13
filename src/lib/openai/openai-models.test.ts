import { OpenAIChatModels, toChatModel } from "./openai-models";
import { ChatModel } from "openai/resources/index.mjs";

describe("OpenAI Models", () => {
  describe("OpenAIChatModels", () => {
    it("should contain a list of predefined models", () => {
      expect(OpenAIChatModels).toContain("gpt-4o");
      expect(OpenAIChatModels).toContain("gpt-3.5-turbo");
      expect(OpenAIChatModels).toContain("o1");
      expect(OpenAIChatModels).toContain("gpt-4-32k-0613");
    });
  });

  describe("toChatModel", () => {
    it("should return the model if it exists in OpenAIChatModels", () => {
      const model = "gpt-4o";
      const result = toChatModel(model);
      expect(result).toBe(model as ChatModel);
    });

    it("should return undefined if the model does not exist in OpenAIChatModels", () => {
      const model = "non-existent-model";
      const result = toChatModel(model);
      expect(result).toBeUndefined();
    });
  });
});