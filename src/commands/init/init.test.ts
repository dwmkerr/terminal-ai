import { getDefaultConfiguration } from "../../configuration/configuration";
import { createTestExecutionContext } from "../../jest/create-test-execution-context";
import { init } from "./init";

describe("commands", () => {
  describe("init", () => {
    xtest("throws if non-interactive", async () => {
      const executionContext = createTestExecutionContext({
        isTTYstdout: true,
      });
      await expect(() => init(executionContext, false)).rejects.toThrow(
        /must be run interactively/,
      );
    });

    xtest("shows a welcome message if no API key has been set", async () => {
      //  At the moment, the presence of the API key is sufficent to say we
      //  are configured. However, soon we'll need a baseurl as well.
      const executionContext = createTestExecutionContext({
        config: {
          ...getDefaultConfiguration(),
          apiKey: "",
        },
      });
      await expect(() => init(executionContext, false)).resolves.toBe(true);
    });
  });
});
