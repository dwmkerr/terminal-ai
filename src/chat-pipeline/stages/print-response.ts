import OpenAI from "openai";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { OutputIntent } from "./parse-input";
import { ChatResponse } from "./parse-response";

export async function printResponse(
  params: ChatPipelineParameters,
  response: ChatResponse,
  outputIntent: OutputIntent,
) {
  //  If we are writing raw output, dump it now and we're done.
  if (params.options.raw) {
    console.log(response.rawMarkdownResponse);
  }

  //  If our output intent is code, then we will write the code block only and
  //  format based on whether we have an output TTY.
  if (outputIntent === OutputIntent.Code) {
    if (params.executionContext.isTTYstdout) {
      console.log(response.codeBlocks[0]?.colourFormattedCode);
    } else {
      console.log(response.codeBlocks[0]?.plainTextCode);
    }
    return;
  }

  //  Finally, write the response. If we have a TTY it'll be coloured, otherwise
  //  it'll be formatted as plain text.
  if (params.executionContext.isTTYstdout) {
    console.log(response.colourFormattedResponseWithPrompt);
  } else {
    console.log(response.plainTextFormattedResponse);
  }
}

/**
 * printStreamResponse - streams response chunks to stdout as they arrive
 *
 * @param stream - async iterable of content chunks
 * @param isTTY - whether stdout is a TTY (for interactive output)
 * @param prompt - optional prompt to display before streaming starts
 * @returns the complete response text
 */
export async function printStreamResponse(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  isTTY: boolean,
  prompt?: string,
): Promise<string> {
  const MAX_CHARS = 8000; // Prevent terminal flooding
  let fullResponse = "";
  let charCount = 0;
  let promptShown = false;

  try {
    for await (const chunk of stream) {
      // Extract content from chunk (OpenAI streaming format)
      const content = chunk.choices?.[0]?.delta?.content || "";

      if (!content) continue;

      // Show prompt once before first content (only for TTY)
      if (!promptShown && isTTY && prompt) {
        process.stdout.write(`${prompt}: `);
        promptShown = true;
      }

      // Check if we're approaching the character limit
      if (charCount + content.length > MAX_CHARS) {
        const remaining = MAX_CHARS - charCount;
        if (remaining > 0) {
          const truncatedContent = content.slice(0, remaining);
          if (isTTY) {
            process.stdout.write(truncatedContent);
          }
          fullResponse += truncatedContent;
        }
        if (isTTY) {
          process.stdout.write(
            "\n[Output truncated - use --raw to see full response]\n",
          );
        }
        fullResponse += content; // Keep full response for history even if display truncated
        break;
      }

      // Write the chunk to stdout if TTY
      if (isTTY) {
        process.stdout.write(content);
      }

      fullResponse += content;
      charCount += content.length;
    }

    // Add final newline if TTY
    if (isTTY && fullResponse.length > 0) {
      process.stdout.write("\n");
    }
  } catch (error) {
    if (isTTY) {
      process.stdout.write(`\n[Streaming error: ${error}]\n`);
    }
    throw error;
  }

  return fullResponse;
}
