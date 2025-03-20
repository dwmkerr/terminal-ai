import { loadConfigurationFromFileContents } from "./configuration-file";

describe("configuration", () => {
  describe("configuration-file", () => {
    test("can load empty contents", () => {
      expect(() => loadConfigurationFromFileContents("")).not.toThrow();
    });

    test("will not fail on unspecified fields", () => {
      //  If our config file has fields we have not specified in the config
      //  type, they will still be loaded. We might ignore them in the future.
      const config = loadConfigurationFromFileContents("unused: value");
      expect(config).toStrictEqual({
        unused: "value",
      });
    });

    test("will fail for malformed YAML", () => {
      //  If our config file is malformed, we should fail.
      const load = () => loadConfigurationFromFileContents("{{}");
      expect(load).toThrow(/YAML Error in config file/);
    });

    test("can load basic provider configuration", () => {
      //  Basic provider config should work.
      const config = loadConfigurationFromFileContents(`
apiKey: secret
baseURL: url
model: gpt4.5
`);
      expect(config).toStrictEqual({
        apiKey: "secret",
        baseURL: "url",
        model: "gpt4.5",
      });
    });

    test("can map fields from 0.11 -> 0.12", () => {
      //  Config from <= 0.11, old names:
      //  - openAiApiKey   -> apiKey
      //  - openai.baseURL -> baseURL
      //  - openai.model   -> model
      const config = loadConfigurationFromFileContents(`
openAiApiKey: key
openai:
  baseURL: url
  model: gpt4.5
`);
      //  Mapped values set and old values unset...
      expect(config).toStrictEqual({
        apiKey: "key",
        baseURL: "url",
        model: "gpt4.5",
      });
    });
  });
});
