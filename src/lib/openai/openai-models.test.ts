import { OpenAIChatModels } from "./openai-models";

describe("OpenAI Models", () => {
  describe("OpenAIChatModels", () => {
    it("should contain a list of predefined models", () => {
      expect(OpenAIChatModels).toContain("gpt-4o");
      expect(OpenAIChatModels).toContain("gpt-3.5-turbo");
      expect(OpenAIChatModels).toContain("o1");
      expect(OpenAIChatModels).toContain("gpt-4-32k-0613");
    });
  });
});
