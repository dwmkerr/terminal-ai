import { ExecutionContext } from "../../execution-context/execution-context";
import { printConfig } from "../../print/print-config";

export async function config(executionContext: ExecutionContext) {
  console.log(JSON.stringify(executionContext.config, null, 2));
  console.log(
    printConfig(executionContext.config, executionContext.isTTYstdout, 0),
  );
}
