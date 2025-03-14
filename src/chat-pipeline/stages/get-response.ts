import dbg from "debug";
import OpenAI from "openai";
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { OpenAIMessage } from "../../lib/openai/openai-message";
import { ERROR_CODE_OPENAI_ERROR, TerminatingError } from "../../lib/errors";
import { startSpinner } from "../../theme";
import { translateError } from "../../lib/translate-error";

const debug = dbg("ai:chat-pipeline:get-response");

export type AssistantsResponse = {
  messages: OpenAIMessage[];
  response: string;
};

export async function getCompletionsResponse(
  params: ChatPipelineParameters,
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string> {
  //  Send the input to ChatGPT and read the response.
  const spinner = await startSpinner(params.executionContext.isTTYstdout);
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: params.config.openai.model,
    });
    spinner.stop();

    //  Read the response. If we didn't get one, show an error. Otherwise
    //  print the response and add to the conversation history.
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new TerminatingError(
        "OpenAI Error - no response received. Try 'ai check' to validate your config",
        ERROR_CODE_OPENAI_ERROR,
      );
    }

    return response;
  } catch (err) {
    spinner.stop();
    throw translateError(err);
  }
}

export async function getAssistantResponse(
  params: ChatPipelineParameters,
  openai: OpenAI,
  assistantId: string,
  threadId: string,
): Promise<AssistantsResponse> {
  const spinner = await startSpinner(params.executionContext.isTTYstdout);
  try {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
    spinner.stop();

    // We're going to do best effort while still learning the assistants api...
    // Note that we're not event catching errors at the moment.
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
  } catch (err) {
    spinner.stop();
    throw translateError(err);
  }
}

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
