import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { init } from "./init";

describe("commands", () => {
  describe("init", () => {
    test("throws if non-interactive", async () => {
      const executionContext = createTestExecutionContext(process, {
        isTTYstdin: false,
      });
      await expect(() => init(executionContext, false)).rejects.toThrow(
        /must be run interactively/,
      );
    });
  });
});
