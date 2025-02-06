// import path from "path";
// import mock from "mock-fs";
import { getDefaultConfiguration } from "./configuration";

describe("configuration", () => {
  // //  Mock the config file.
  // beforeEach(() => {
  //   const boxesPath = path.join(path.resolve(), "./boxes.json");
  //   mock({
  //     [boxesPath]: mock.load(
  //       path.join(path.resolve(), "./src/fixtures/boxes.json"),
  //     ),
  //   });
  // });

  // afterEach(() => {
  //   mock.restore();
  // });

  describe("getDefaultConfiguration", () => {
    test("can get correct default configuration", () => {
      const defaultConfiguration = getDefaultConfiguration();
      expect(defaultConfiguration.openAiApiKey).toBe("");
    });
  });
});
