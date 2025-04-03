import fs from "fs";
import path from "path";
import {
  hydratePromptsFolder,
  loadConfigationFromPromptsFolder,
} from "./configuration-prompts-folder";
import { ConfigurationPaths } from "./configuration";

describe("configuration", () => {
  describe("loadConfigationFromPromptsFolder", () => {
    test("can load unhydrated configuration prompts from folder", () => {
      //  In Jest we run from the project root, so we load from...
      const promptsFolderInJestContext = "./prompts";
      const config = loadConfigationFromPromptsFolder(
        promptsFolderInJestContext,
      );

      expect(config.prompts?.chat?.context?.[0]).toMatch(
        /You are an assistant called \'Terminal AI\'/,
      );
      expect(config.prompts?.chat?.context?.[1]).toMatch(
        /My OS Platform is \$\{OS_PLATFORM\} my shell is \$\{SHELL\}/,
      );
      expect(config.prompts?.code?.output?.[0]).toMatch(
        /In your output, give me code only/,
      );
    });
  });

  describe("hydratePromptsFolder", () => {
    let tempConfigFolder: string;
    let tempPromptsFolder: string;

    beforeEach(() => {
      tempConfigFolder = fs.mkdtempSync(`ai-tests`);
      tempPromptsFolder = path.join(
        tempConfigFolder,
        ConfigurationPaths.ConfigFolder,
        ConfigurationPaths.PromptsFolder,
      );
    });

    afterEach(() => {
      fs.rmdirSync(tempConfigFolder, { recursive: true });
    });

    test("can hydrate prompts folder", () => {
      //  In Jest we run from the project root, so we load from...
      const promptsFolderInJestContext = "./prompts";
      hydratePromptsFolder(promptsFolderInJestContext, tempPromptsFolder);
      expect(
        fs.existsSync(
          path.join(
            tempPromptsFolder,
            ConfigurationPaths.ChatPromptsContextFolder,
            "context.txt",
          ),
        ),
      );
      expect(
        fs.existsSync(
          path.join(
            tempPromptsFolder,
            ConfigurationPaths.CodePromptsOutputFolder,
            "context.txt",
          ),
        ),
      );
    });
  });
});
