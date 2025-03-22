import { getDefaultConfiguration } from "../../configuration/configuration";
import { ExecutionContext } from "../../lib/execution-context";
import { init } from "./init";

describe("commands", () => {
  describe("init", () => {
    test("throws if non-interactive", async () => {
      const executionContext: ExecutionContext = {
        config: getDefaultConfiguration(),
        isTTYstdin: false,
        isTTYstdout: true,
        stdinContent: undefined,
      };
      await expect(() => init(executionContext, false)).rejects.toThrow(
        /must be run interactively/,
      );
    });

    xtest("shows a welcome message if no API key has been set", async () => {
      //  At the moment, the presence of the API key is sufficent to say we
      //  are configured. However, soon we'll need a baseurl as well.
      const executionContext: ExecutionContext = {
        config: {
          ...getDefaultConfiguration(),
          apiKey: "",
        },
        isTTYstdin: true,
        isTTYstdout: true,
        stdinContent: undefined,
      };
      await expect(() => init(executionContext, false)).resolves.toBe(true);
    });
  });
});
