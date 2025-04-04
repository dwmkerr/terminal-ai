import { getDefaultConfiguration } from "../configuration/configuration";
import {
  ExecutionContext,
  ProcessLike,
} from "../execution-context/execution-context";

export function createTestExecutionContext(
  process: ProcessLike,
  overrides: Partial<ExecutionContext> = {},
): ExecutionContext {
  //  Create default configuration, common context, update, return.
  const config = getDefaultConfiguration();
  return {
    process,
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
    ...overrides,
  };
}
