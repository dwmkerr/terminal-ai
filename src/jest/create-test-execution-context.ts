import { getDefaultConfiguration } from "../configuration/configuration";
import { ExecutionContext } from "../lib/execution-context";

export function createTestExecutionContext(
  overrides: Partial<ExecutionContext> = {},
): ExecutionContext {
  //  Create default configuration, common context, update, return.
  const config = getDefaultConfiguration();
  return {
    config,
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
