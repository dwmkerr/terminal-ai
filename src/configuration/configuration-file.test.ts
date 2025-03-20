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

    xtest("will ignore unused contents", () => {
      //  If our config file is malformed, we should fail.
      const load = () => loadConfigurationFromFileContents(":invalid-yaml");
      expect(load).toThrow(/some error/);
    });

    test("can load basic provider configuration", () => {
      //  Basic provider config should work.
      const config = loadConfigurationFromFileContents(`
apiKey: secret
baseURL: url
model: gpt4.5
`);
      expect(config).toMatchObject({
        apiKey: "secret",
        baseURL: "url",
        model: "gpt4.5",
      });
    });
  });
});
