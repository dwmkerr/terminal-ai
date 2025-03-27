import { ExecutionContext } from "../../execution-context/execution-context";
import { printConfig } from "../../print/print-config";

export async function config(executionContext: ExecutionContext) {
  console.log(`---\n# Config`);
  console.log(
    printConfig(executionContext.config, executionContext.isTTYstdout, 0),
  );
  console.log(`---\n# Execution Context Provider`);
  console.log(
    printConfig(executionContext.provider, executionContext.isTTYstdout, 0),
  );
}
