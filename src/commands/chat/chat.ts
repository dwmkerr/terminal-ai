import { ExecutionContext } from "../../execution-context/execution-context";
import { executeChatPipeline } from "../../chat-pipeline/chat-pipeline-completion-api";
import { executeChatPipeline as executeAssistantPipeline } from "../../chat-pipeline/chat-pipeline-assistant-api";
import { ensureApiKey } from "../../chat-pipeline/stages/ensure-api-key";
import {
  ChatContext,
  initialChatContext,
} from "../../chat-pipeline/ChatContext";

export async function chat(
  executionContext: ExecutionContext,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  enableOutputPrompts: boolean,
  copy: boolean,
  raw: boolean,
  assistant: boolean,
  files: string[],
  imageFiles: string[],
) {
  //  Ensure we are configured sufficiently.
  await ensureApiKey(executionContext);

  //  A clean initial chat context.
  const chatContext: ChatContext = {
    ...initialChatContext(),
    filePathsOutbox: files,
    imageFilePathsOutbox: imageFiles,
  };

  if (!assistant) {
    return await executeChatPipeline({
      executionContext,
      chatContext,
      inputMessage,
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
      chatContext,
      inputMessage,
      options: {
        enableContextPrompts,
        enableOutputPrompts,
        copy,
        raw,
      },
    });
  }
}
