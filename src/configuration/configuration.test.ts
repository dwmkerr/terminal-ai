import { getDefaultConfiguration } from "./configuration";

describe("configuration", () => {
  describe("getDefaultConfiguration", () => {
    test("can get correct default configuration", () => {
      const defaultConfiguration = getDefaultConfiguration();
      expect(defaultConfiguration.openAiApiKey).toBe("");
    });
  });
});
