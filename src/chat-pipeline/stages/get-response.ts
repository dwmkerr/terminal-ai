import dbg from "debug";
import OpenAI from "openai";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

import { chat } from "../../commands/chat";
import { OpenAIMessage } from "../../lib/openai/openai-message";
import { Message } from "openai/resources/beta/threads/messages.mjs";

const debug = dbg("ai:chat-pipeline:get-response");

export async function getResponse(
  params: ChatPipelineParameters,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string> {
  const response = await chat(params.executionContext, params.config, messages);
  return response;
}

export type AssistantsResponse = {
  messages: OpenAIMessage[];
  response: string;
};

export function messageToResponse(message: Message): OpenAIMessage {
  const role = message.role;
  let messageText = "";

  //  Go through the message content and aggregate into a single 'text' value.
  //  If we have content that we cannot yet process, we'll log a debug message
  //  and write some info but not fail - as the assistants flow is still
  //  experimental in the app.
  for (let i = 0; i < message.content.length; i++) {
    const content = message.content[i];
    if (content.type == "text") {
      debug(`message text: ${content.text.value}`);
      messageText += content.text.value;
    } else {
      const text = `<Unprocessed Message of type ${message.content[0].type}>`;
      messageText += text;
      debug(`unprocessed message of type: `, message.content[0].type);
    }
  }
  return {
    role,
    content: messageText,
  };
}

export async function getAssistantResponse(
  params: ChatPipelineParameters,
  openai: OpenAI,
  assistantId: string,
  threadId: string,
): Promise<AssistantsResponse> {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  // we're going to do best effort while still learning the assistants api...
  let openAImessages: OpenAIMessage[] = [];
  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    openAImessages = openAImessages.concat(
      messages.data.reverse().map(messageToResponse),
    );
  } else {
    debug(`run ended with status: `, run.status);
  }

  //  Return the full set of messages. The response is the most recent message.
  return {
    messages: openAImessages,
    response:
      openAImessages.length > 0
        ? openAImessages[openAImessages.length - 1].content
        : "",
  };
}
