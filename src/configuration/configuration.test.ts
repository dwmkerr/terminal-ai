import { getDefaultConfiguration } from "./configuration";

describe("configuration", () => {
  describe("getDefaultConfiguration", () => {
    test("can get correct default configuration", () => {
      const defaultConfiguration = getDefaultConfiguration();
      expect(defaultConfiguration.apiKey).toBe("");
      expect(defaultConfiguration.baseURL).toBe("https://api.openai.com/v1/");
      expect(defaultConfiguration.model).toBe("gpt-3.5-turbo");

      expect(defaultConfiguration.debug.enable).toBe(false);
      expect(defaultConfiguration.debug.namespace).toBe("ai*");
    });
  });
});
