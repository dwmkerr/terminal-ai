import { getDefaultConfiguration } from "../configuration/configuration";
import { ExecutionContext } from "../execution-context/execution-context";

export function createTestExecutionContext(
  overrides: Partial<ExecutionContext> = {},
): ExecutionContext {
  //  Create default configuration, common context, update, return.
  const config = getDefaultConfiguration();
  return {
    configFilePath: "./config.test.yaml",
    config,
    isFirstRun: false,
    provider: {
      name: "",
      baseURL: "",
      model: "",
      apiKey: "",
    },
    isTTYstdin: true,
    isTTYstdout: true,
    stdinContent: undefined,
    ...overrides,
  };
}
