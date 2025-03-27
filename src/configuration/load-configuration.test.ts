import fs from "fs";
import path from "path";
import { ConfigurationPaths, getDefaultConfiguration } from "./configuration";
import { loadConfiguration } from "./load-configuration";

describe("configuration", () => {
  describe("loadConfiguration", () => {
    let tempTestFolder: string;
    let tempConfigFolder: string;
    let tempConfigFilePath: string;
    let tempConfigPromptsFolder: string;
    let tempConfigChatPromptsFolder: string;
    let tempConfigCodePromptsFolder: string;

    beforeEach(() => {
      tempTestFolder = fs.mkdtempSync(`ai-tests`);
      tempConfigFolder = path.join(
        tempTestFolder,
        ConfigurationPaths.ConfigFolder,
      );
      tempConfigFilePath = path.join(
        tempTestFolder,
        ConfigurationPaths.ConfigFolder,
        ConfigurationPaths.ConfigFile,
      );
      tempConfigPromptsFolder = path.join(
        tempConfigFolder,
        ConfigurationPaths.ConfigFolder,
      );
      tempConfigChatPromptsFolder = path.join(
        tempConfigPromptsFolder,
        ConfigurationPaths.ChatPromptsContextFolder,
      );
      tempConfigCodePromptsFolder = path.join(
        tempConfigPromptsFolder,
        ConfigurationPaths.CodePromptsOutputFolder,
      );
      fs.mkdirSync(tempConfigFolder, { recursive: true });
      fs.mkdirSync(tempConfigPromptsFolder, { recursive: true });
      fs.mkdirSync(tempConfigChatPromptsFolder, { recursive: true });
      fs.mkdirSync(tempConfigCodePromptsFolder, { recursive: true });
    });

    afterEach(() => {
      fs.rmdirSync(tempTestFolder, { recursive: true });
    });

    test("correctly enriches default configuration with file, prompts and env", async () => {
      //  Create the default config.
      const defaultConfig = getDefaultConfiguration();

      //  Write two context files.
      fs.writeFileSync(
        path.join(tempConfigChatPromptsFolder, "context.txt"),
        `this is chat context`,
      );
      fs.writeFileSync(
        path.join(tempConfigCodePromptsFolder, "context.txt"),
        `this is code context`,
      );

      //  Write a config file - note this will override the default config
      //  baseURL.
      fs.writeFileSync(
        tempConfigFilePath,
        `apiKey: testKey
baseURL: http://newurl.com/v1
provider: gemini
providers:
  gemini:
    type: "gemini"
    apiKey: ""
    baseURL: "https://generativelanguage.googleapis.com/v1beta/"
    model: "models/gemini-2.0-flash"
prompts:
  code:
    output:
    - this is additional code context`,
      );

      //  Create some environment config that overrides file config and enriches
      //  default config.
      const env = {
        AI_BASE_URL: "http://newurl.com/v1/OVERRIDDEN",
        AI_DEBUG_ENABLE: "1",
      };

      //  Load the config, which will go prompts > file > env.
      const loadedConfig = await loadConfiguration(
        tempConfigPromptsFolder,
        tempConfigFilePath,
        env,
      );

      //  We will now test that we have the default configuration, then the
      //  prompt configuration, then the updated file configuration, then the
      //  env configuration, seeing that things are overwritten along the way.
      expect(loadedConfig).toStrictEqual({
        ...defaultConfig,
        apiKey: "testKey",
        //  Overriden by AI_BASE_URL.
        baseURL: "http://newurl.com/v1/OVERRIDDEN",
        model: "gpt-3.5-turbo",
        provider: "gemini",
        providers: {
          gemini: {
            name: "gemini", // note this wasn't in config, it's set on file load
            apiKey: "",
            type: "gemini",
            //  Overriden by AI_BASE_URL.
            baseURL: "http://newurl.com/v1/OVERRIDDEN",
            model: "models/gemini-2.0-flash",
          },
        },
        prompts: {
          chat: {
            context: ["this is chat context"],
          },
          code: {
            output: ["this is code context", "this is additional code context"],
          },
        },
        integrations: {},
        debug: {
          enable: true, // overriden via env var
          namespace: "ai*",
        },
      });
    });

    it("correctly overrides the root provider with AI_API_KEY, AI_BASE_URL and AI_MODEL and does not assume first run", async () => {
      const env = {
        AI_API_KEY: "overrideKey",
        AI_BASE_URL: "overrideBaseURL",
        AI_MODEL: "overrideModel",
      };

      //  Load the config, which will go prompts > file > env.
      const loadedConfig = await loadConfiguration(
        tempConfigPromptsFolder,
        tempConfigFilePath,
        env,
      );

      //  Check for the expected execution context.
      expect(loadedConfig).toStrictEqual({
        //  As expected, our config has been overridden.
        ...getDefaultConfiguration(),
        apiKey: "overrideKey",
        baseURL: "overrideBaseURL",
        model: "overrideModel",
      });
    });

    it("correctly overrides the configured named provider with AI_API_KEY, AI_BASE_URL and AI_MODEL and does not assume first run", async () => {
      const env = {
        AI_API_KEY: "overrideKey",
        AI_BASE_URL: "overrideBaseURL",
        AI_MODEL: "overrideModel",
      };

      //  Write a config file - note that the configured provider should be
      //  overriden.
      fs.writeFileSync(
        tempConfigFilePath,
        `provider: gemini
providers:
  gemini:
    type: "gemini_openai"
    apiKey: ""
    baseURL: "https://generativelanguage.googleapis.com/v1beta/"
    model: "models/gemini-2.0-flash"
  openai:
    type: "openai"
    apiKey: "oapi"
    baseURL: "ourl"
    model: "omodel"`,
      );

      //  Load the config, which will go prompts > file > env.
      const loadedConfig = await loadConfiguration(
        tempConfigPromptsFolder,
        tempConfigFilePath,
        env,
      );

      //  Check for the expected config context, this time with providers,
      expect(loadedConfig).toStrictEqual({
        ...getDefaultConfiguration(),
        //  Root has been overridden...
        apiKey: "overrideKey",
        baseURL: "overrideBaseURL",
        model: "overrideModel",
        //  Named provider has been overriden.
        provider: "gemini",
        providers: {
          gemini: {
            name: "gemini",
            type: "gemini_openai",
            apiKey: "overrideKey",
            baseURL: "overrideBaseURL",
            model: "overrideModel",
          },
          openai: {
            name: "openai",
            type: "openai",
            apiKey: "oapi",
            baseURL: "ourl",
            model: "omodel",
          },
        },
      });
    });
  });
});
