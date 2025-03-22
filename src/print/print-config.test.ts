import { printConfig, printConfigValue } from "./print-config";

describe("configuration", () => {
  describe("printConfigValue", () => {
    test("can print primitive types", () => {
      expect(printConfigValue("string", false, 0)).toBe('"string"');
      expect(printConfigValue(5, false, 0)).toBe("5");
      expect(printConfigValue(3.23, false, 0)).toBe("3.23");
      expect(printConfigValue(true, false, 0)).toBe("true");
      expect(printConfigValue(false, false, 0)).toBe("false");
      expect(printConfigValue(null, false, 0)).toBe("null");
      expect(printConfigValue(undefined, false, 0)).toBe(undefined);
    });

    test("can print arrays", () => {
      expect(printConfigValue([1, 2, "3"], false, 0)).toBe(`
  - 1
  - 2
  - "3"`);
    });
  });

  describe("printConfig", () => {
    test("can print basic config without color and formatting", () => {
      const interactive = false;
      const config = {
        key: "value",
        array: [1, 2, 3],
        string: "shhh",
        obj: {
          num: 12,
          text: "whatever",
        },
      };
      // (config.secret as ConfigItem).sensitive = true;
      // (config.overridenItem as ConfigItem).overridden = "env";
      const output = printConfig(config, interactive, 0);
      expect(output).toEqual(`key: "value"
array: 
  - 1
  - 2
  - 3
string: "shhh"
obj: 
  num: 12
  text: "whatever"`);

      // // Get terminal width (for cropping)
      // const { columns } = process.stdout;
      // displayConfig(myConfig, 0, columns);
    });
  });
});
