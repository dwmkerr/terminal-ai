import { ExecutionContext } from "../../execution-context/execution-context";

export function checkFirstRun(executionContext: ExecutionContext): boolean {
  //  The most common indicator we're a first run - no api key.
  if (executionContext.config.apiKey === "") {
    return true;
  }

  //  More unusual - someone has explicitly blatted the baseUrl in config.
  //  Without the baseurl we cannot run.
  if (executionContext.config.baseURL === "") {
    return true;
  }

  return false;
}
