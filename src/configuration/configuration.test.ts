import { getDefaultConfiguration } from "./configuration";

describe("configuration", () => {
  describe("getDefaultConfiguration", () => {
    test("can get correct default configuration", () => {
      const defaultConfiguration = getDefaultConfiguration();
      expect(defaultConfiguration).toStrictEqual({
        apiKey: "",
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
        providers: {},
        prompts: {
          chat: {
            context: [],
          },
          code: {
            output: [],
          },
        },
        integrations: {},
        debug: {
          enable: false,
          namespace: "ai*",
        },
      });
    });
  });
});
