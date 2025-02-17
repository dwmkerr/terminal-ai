import dbg from "debug";
import OpenAI from "openai";
import theme from "../../theme";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

import { chat } from "../../commands/chat";
import { plainTextCode } from "../../lib/markdown";

const debug = dbg("ai:chat-pipeline:completion");

export type CodeBlock = {
  language: string;
  rawMarkdownCode: string;
  colourFormattedCode: string;
  plainTextCode: string;
};

export type ChatResponse = {
  rawMarkdownResponse: string;
  colourFormattedResponse: string;
  plainTextFormattedResponse: string;
  codeBlocks: CodeBlock[];
};

export function parseResponse(rawMarkdownResponse: string): ChatResponse {
  //  Take the raw response, which is markdown, then create a coloured version
  //  of it suitable for printing to a TTY, as well as a plain text version
  //  of it, suitable for writng to a file.
  //  Note that we're creating a coloured repsonse here no matter what...
  const colourFormattedResponse = theme.printResponse(
    rawMarkdownResponse,
    true,
  );

  //  ...and here we remove the colour. We also do our best effort to extract
  //  the source code - this 'plainTextCode' only really makes sense if our
  //  output only contains code, so we could do better here.
  //  Issue: #X1
  const plainTextFormattedResponse = plainTextCode(colourFormattedResponse);
  const codeBlock = {
    language: "",
    rawMarkdownCode: rawMarkdownResponse,
    colourFormattedCode: colourFormattedResponse,
    plainTextCode: plainTextFormattedResponse,
  };

  return {
    rawMarkdownResponse,
    colourFormattedResponse,
    plainTextFormattedResponse,
    codeBlocks: [codeBlock],
  };
}

export async function getResponse(
  params: ChatPipelineParameters,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string> {
  const response = await chat(params.executionContext, params.config, messages);
  return response;
}

export async function getAssistantResponse(
  params: ChatPipelineParameters,
  openai: OpenAI,
  assistantId: string,
  threadId: string,
): Promise<string> {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  // we're going to do best effort while still learning the assistants api...
  let response = "";
  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      for (let i = 0; i < message.content.length; i++) {
        const content = message.content[i];
        if (content.type == "text") {
          const text = content.text;
          response = text.value; // this is the response we'll use...
          debug(`${i}: ${message.role} > ${text.value}`);
          console.log(
            `console version of message (are there newlines?): ${text.value}`,
          );
        } else {
          debug(`unable to process message type: `, message.content[0].type);
        }
      }
    }
  } else {
    debug(`run ended with status: `, run.status);
  }

  return response;
}
