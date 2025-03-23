import { getDefaultConfiguration } from "../../configuration/configuration";
import { createTestExecutionContext } from "../../jest/create-test-execution-context";
import { checkFirstRun } from "./check-first-run";

describe("init", () => {
  describe("checkFirstRun", () => {
    test("can correctly identify default config as first run", () => {
      const executionContext = createTestExecutionContext();
      expect(checkFirstRun(executionContext)).toBe(true);
    });

    test("assumes first run if a baseurl has been unset", () => {
      const config = {
        ...getDefaultConfiguration(),
        baseURL: "", // i.e. the openai default has been splatted
      };
      const executionContext = createTestExecutionContext({ config });
      expect(checkFirstRun(executionContext)).toBe(true);
    });
  });
});
