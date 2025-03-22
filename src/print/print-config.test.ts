import { printConfig } from "./print-config";

describe("configuration", () => {
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
