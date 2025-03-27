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

    it("fails with an Invalid Operation Error if the path is invalid", () => {
      const call = () =>
        updateConfigurationFile("/invalid-dir/" + tempConfigFilePath, {
          key: "value",
        });
      expect(call).toThrow(/error updating config file \/invalid-dir\//);
    });

    test("creates and updates config file and parent folder if it doesn't exist", () => {
      //  Delete the config folder first, assert it's gone...
      fs.rmdirSync(tempTestFolder, { recursive: true });
      expect(fs.existsSync(tempTestFolder)).toBe(false);
      expect(fs.existsSync(tempConfigFilePath)).toBe(false);

      //  Update the config file - the parent folder and file should be created.
      updateConfigurationFile(tempConfigFilePath, { key: "value" });
      expect(fs.existsSync(tempTestFolder)).toBe(true);
      expect(fs.existsSync(tempConfigFilePath)).toBe(true);
      const contents = fs.readFileSync(tempConfigFilePath, {
        encoding: "utf8",
      });
      expect(contents).toBe(`key: value\n`);
    });

    it("creates and replaces config file values correctly", () => {
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
