import { select } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { ErrorCode, TerminalAIError } from "../lib/errors";

export const AttachFileAction: ChatAction = {
  id: "attach_file",
  displayNameInitial: "Attach File",
  displayNameReply: "Attach File",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 0,
  execute: async (
    params: ChatPipelineParameters,
  ): Promise<string | undefined> => {
    const fileSelector = (await import("inquirer-file-selector")).default;
    const path = await fileSelector({
      message: "File path:",
      type: "file",
    });
    const fileType = await select({
      message: "File processing mode:",
      choices: [
        {
          name: "Text",
          value: "text",
          description: "Process as text. Ideal for code, documents, etc.",
        },
        {
          name: "Image",
          value: "image",
          description:
            "Vision processing (model dependent). Enables image recognition, etc.",
        },
      ],
    });
    if (fileType === "text") {
      params.chatContext.filePathsOutbox.push(path);
    } else if (fileType === "image") {
      params.chatContext.imageFilePathsOutbox.push(path);
    } else {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        "unknown file processing '${fileType}'",
      );
    }

    return undefined;
  },
};
