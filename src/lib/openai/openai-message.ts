import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { OpenAIChatRoles } from "./openai-roles";
import {
  MessageContentPartParam,
  MessageCreateParams,
} from "openai/resources/beta/threads/messages.mjs";
import { ErrorCode, TerminalAIError } from "../errors";

export type OpenAIMessage = {
  role: OpenAIChatRoles;
  content: string;
};

export function convertChatCompletionToAssistantMessages(
  messages: ChatCompletionMessageParam[],
): MessageCreateParams[] {
  return messages.map((message) => {
    let content: string | MessageContentPartParam[];

    if (typeof message.content === "string") {
      // Simple text content
      content = message.content;
    } else if (Array.isArray(message.content)) {
      // Complex message parts (text, images, etc.)
      content = message.content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: part.text };
        } else if (part.type === "image_url") {
          return { type: "image_url", image_url: { url: part.image_url.url } };
        } else {
          throw new TerminalAIError(
            ErrorCode.CompatibilityError,
            `unknown message part type '${part.type}' converting chat completion API message to assisants API message`,
          );
        }
      });
    } else {
      throw new TerminalAIError(
        ErrorCode.CompatibilityError,
        `unknown content type '${JSON.stringify(message.content)}' converting chat completion API message to assisants API message`,
      );
    }

    if (message.role !== "user" && message.role !== "assistant") {
      throw new TerminalAIError(
        ErrorCode.CompatibilityError,
        `unknown role '${message.role}' converting chat completion API message to assisants API message`,
      );
    }

    return {
      role: message.role,
      content,
    };
  });
}
