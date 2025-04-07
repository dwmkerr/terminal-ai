import { MessageCreateParams } from "openai/resources/beta/threads/messages.mjs";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { convertChatCompletionToAssistantMessages } from "./openai-message";

describe("lib/openai/openai-message", () => {
  describe("convertChatCompletionToAssistantMessages", () => {
    it("should convert simple text messages correctly", () => {
      const inputMessages: ChatCompletionMessageParam[] = [
        { role: "user", content: "Hello!" },
        { role: "assistant", content: "Hi, how can I help you?" },
      ];

      const expectedOutput: MessageCreateParams[] = [
        { role: "user", content: "Hello!" },
        { role: "assistant", content: "Hi, how can I help you?" },
      ];

      const output = convertChatCompletionToAssistantMessages(inputMessages);
      expect(output).toEqual(expectedOutput);
    });

    it("should convert messages with mixed content correctly", () => {
      const inputMessages: ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "Check this image" },
            {
              type: "image_url",
              image_url: { url: "https://example.com/image.png" },
            },
          ],
        },
      ];

      const expectedOutput: MessageCreateParams[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "Check this image" },
            {
              type: "image_url",
              image_url: { url: "https://example.com/image.png" },
            },
          ],
        },
      ];

      const output = convertChatCompletionToAssistantMessages(inputMessages);
      expect(output).toEqual(expectedOutput);
    });

    it("should throw an error for unsupported message parts", () => {
      const inputMessages: ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: [
            { type: "unsupported_type" as "text", text: "Unsupported content" },
          ],
        },
      ];

      expect(() =>
        convertChatCompletionToAssistantMessages(inputMessages),
      ).toThrow(/unknown message part type 'unsupported_type'/);
    });

    it("should throw an error for unsupported roles", () => {
      const inputMessages: ChatCompletionMessageParam[] = [
        { role: "developer", content: "Developer message" },
      ];

      expect(() =>
        convertChatCompletionToAssistantMessages(inputMessages),
      ).toThrow(/unknown role 'developer'/);
    });
  });
});
