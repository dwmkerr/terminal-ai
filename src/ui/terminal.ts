import { ProcessLike } from "../execution-context/execution-context";

export function terminalWidth(process: ProcessLike): number {
  return process.stdout.columns || 80;
}
