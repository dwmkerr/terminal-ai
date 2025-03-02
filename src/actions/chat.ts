import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";
import { executeChatPipeline } from "../chat-pipeline/chat-pipeline-completion-api";
import { executeChatPipeline as executeAssistantPipeline } from "../chat-pipeline/chat-pipeline-assistant-api";

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  enableOutputPrompts: boolean,
  interactive: boolean,
  copy: boolean,
  raw: boolean,
  assistant: boolean,
  files: string[],
) {
  if (!assistant) {
    return await executeChatPipeline({
      executionContext,
      config,
      inputMessage,
      inputFilePaths: files,
      options: {
        reopenStdin: interactive,
        enableContextPrompts,
        enableOutputPrompts,
        copy,
        raw,
      },
    });
  } else {
    return await executeAssistantPipeline({
      executionContext,
      config,
      inputMessage,
      inputFilePaths: files,
      options: {
        reopenStdin: interactive,
        enableContextPrompts,
        enableOutputPrompts,
        copy,
        raw,
      },
    });
  }
}
