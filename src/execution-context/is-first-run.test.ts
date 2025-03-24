import { getDefaultConfiguration } from "../configuration/configuration";
import { isFirstRun } from "./is-first-run";

describe("execution-context", () => {
  describe("isFirstRun", () => {
    test("can correctly identify default config as first run", () => {
      const config = getDefaultConfiguration();
      expect(isFirstRun(config)).toBe(true);
    });

    test("assumes first run if a baseurl has been unset", () => {
      const config = {
        ...getDefaultConfiguration(),
        baseURL: "", // i.e. the openai default has been splatted
      };
      expect(isFirstRun(config)).toBe(true);
    });
  });
});
