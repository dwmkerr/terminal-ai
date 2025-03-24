import fs from "fs";
import path from "path";
import { ConfigurationPaths } from "./configuration";
import { updateConfigurationFile } from "./update-configuration-file";

describe("configuration", () => {
  describe("updateConfigurationFile", () => {
    let tempTestFolder: string;
    let tempConfigFilePath: string;

    beforeEach(() => {
      tempTestFolder = fs.mkdtempSync(`ai-tests`);
      fs.mkdirSync(path.join(tempTestFolder, ConfigurationPaths.ConfigFolder));
      tempConfigFilePath = path.join(
        tempTestFolder,
        ConfigurationPaths.ConfigFolder,
        ConfigurationPaths.ConfigFile,
      );
    });

    afterEach(() => {
      fs.rmdirSync(tempTestFolder, { recursive: true });
    });

    test("creates and updates config file if it doesn't exist", () => {
      expect(fs.existsSync(tempConfigFilePath)).toBe(false);
      updateConfigurationFile(tempConfigFilePath, { key: "value" });
      expect(fs.existsSync(tempConfigFilePath)).toBe(true);
      const contents = fs.readFileSync(tempConfigFilePath, {
        encoding: "utf8",
      });
      expect(contents).toBe(`key: value\n`);
    });

    test("creates and replaces config file values correctly", () => {
      fs.writeFileSync(
        tempConfigFilePath,
        `key: value
obj:
  nestedKey: nestedValue\n`,
      );
      updateConfigurationFile(tempConfigFilePath, {
        key: "newValue",
        ["obj.nestedKey"]: "newNestedValue",
      });
      const contents = fs.readFileSync(tempConfigFilePath, {
        encoding: "utf8",
      });
      expect(contents).toBe(
        `key: newValue
obj:
  nestedKey: newNestedValue\n`,
      );
    });
  });
});
