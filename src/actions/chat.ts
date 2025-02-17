import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";
import { executeChatPipeline } from "../chat-pipeline/chat-pipeline-completion-api";

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  enableOutputPrompts: boolean,
  copy: boolean,
  raw: boolean,
  files: string[],
) {
  return await executeChatPipeline({
    executionContext,
    config,
    inputMessage,
    inputFilePaths: files,
    options: {
      enableContextPrompts,
      enableOutputPrompts,
      copy,
      raw,
    },
  });
}
