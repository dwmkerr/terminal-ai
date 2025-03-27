import { ExecutionContext } from "../../execution-context/execution-context";
import { executeChatPipeline } from "../../chat-pipeline/chat-pipeline-completion-api";
import { executeChatPipeline as executeAssistantPipeline } from "../../chat-pipeline/chat-pipeline-assistant-api";
import { ensureApiKey } from "../../chat-pipeline/stages/ensure-api-key";

export async function chat(
  executionContext: ExecutionContext,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  enableOutputPrompts: boolean,
  copy: boolean,
  raw: boolean,
  assistant: boolean,
  files: string[],
) {
  //  Ensure we are configured sufficiently.
  await ensureApiKey(executionContext);

  if (!assistant) {
    return await executeChatPipeline({
      executionContext,
      inputMessage,
      inputFilePaths: files,
      options: {
        enableContextPrompts,
        enableOutputPrompts,
        copy,
        raw,
      },
    });
  } else {
    return await executeAssistantPipeline({
      executionContext,
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
}
