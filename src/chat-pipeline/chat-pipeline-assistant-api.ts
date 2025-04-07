import OpenAI from "openai";
import dbg from "debug";
import { parseInput } from "./stages/parse-input";
import { createAssistant } from "./stages/create-assistant";
import { ChatPipelineParameters } from "./ChatPipelineParameters";
import { initialInput } from "./stages/initial-input";
import { buildContext } from "./stages/build-context";
import { buildOutputIntentContext } from "./stages/build-output-intent-context";
import { getAssistantResponse } from "./stages/get-response";
import { copyResponse } from "./stages/copy-response";
import { printResponse } from "./stages/print-response";
import { nextInputOrAction } from "./stages/next-input-or-action";
import { parseResponse } from "./stages/parse-response";
import { translateError } from "../lib/translate-error";
import { getProviderPrompt } from "../providers/get-provider-prompt";
import { loadAndAppendInputFiles } from "./stages/load-and-append-input-files";
import { convertChatCompletionToAssistantMessages } from "../lib/openai/openai-message";

const debug = dbg("ai:chat-pipeline-assistant");

export async function executeChatPipeline(parameters: ChatPipelineParameters) {
  //  Ensure we have the required configuration.
  const { executionContext, chatContext } = parameters;
  const config = executionContext.config;
  const params = { ...parameters, config };
  const openai = new OpenAI({
    apiKey: parameters.executionContext.provider.apiKey,
    baseURL: parameters.executionContext.provider.baseURL,
  });

  //  Create the assistant and thread. We must also track how many of our chat
  //  context messages have been sent (as we only send new ones).
  try {
    const assistant = await createAssistant(openai, params.executionContext);
    const thread = await openai.beta.threads.create();
    let currentMessageIndex = 0; // how many of our chat context messages sent.

    //  Get all context prompts and add them to a new conversation.
    const contextPrompts = await buildContext(params, process.env);
    chatContext.messages.push(
      ...contextPrompts.map((c) => ({ role: c.role, content: c.context })),
    );

    //  Determine our initial input. Might be from the command line params, user
    //  entry, stdin, etc...
    let chatInput = await initialInput(params);

    //  Repeatedly interact with ChatGPT as long as we have chat input.
    while (chatInput !== "") {
      //  Load files into convo, deconstruct chat input into message and intent.
      await loadAndAppendInputFiles(
        params.chatContext,
        executionContext.process.stdin,
        params.executionContext.isTTYstdout,
      );
      const inputAndIntent = parseInput(chatInput);

      //  Create all output intent prompts.
      //  Add them to the conversation history.
      const outputPrompts = await buildOutputIntentContext(
        params,
        process.env,
        inputAndIntent.outputIntent,
      );
      chatContext.messages.push(
        ...outputPrompts.map((p) => ({ role: p.role, content: p.context })),
      );

      //  Add the user's message and get the response. The prompt will be
      //  something like 'chatgpt' or 'gemini'.
      const prompt = getProviderPrompt(params.executionContext.provider);
      chatContext.messages.push({
        role: "user",
        content: inputAndIntent.message,
      });

      //  Update the thread and get the response from the completion api.
      const messagesToSend = chatContext.messages.slice(currentMessageIndex);
      debug(`sending ${messagesToSend.length} messages...`);
      const threadMessages =
        convertChatCompletionToAssistantMessages(messagesToSend);
      for (const message of threadMessages) {
        await openai.beta.threads.messages.create(thread.id, message);
      }
      const { response: rawMarkdownResponse, messages } =
        await getAssistantResponse(params, openai, assistant.id, thread.id);
      const response = parseResponse(prompt, rawMarkdownResponse);

      //  If the intent is to copy the response, copy it and we're done.
      if (await copyResponse(params, response)) {
        return;
      }

      //  Print the response. Might be raw / code / std
      printResponse(params, response, inputAndIntent.outputIntent);

      //  If we are not interactive on stdin/stdout,
      //  there's nothing left to do and we can terminate.
      if (
        !params.executionContext.isTTYstdin ||
        !params.executionContext.isTTYstdout
      ) {
        return;
      }

      //  Note that we do not need to add the response to the thread - openai
      //  handles this for us. But we do need to add the response to the chat
      //  history. Update our conversation messages position.
      chatContext.messages.push({
        role: "assistant",
        content: response.rawMarkdownResponse,
      });
      currentMessageIndex = chatContext.messages.length;

      //  We continue the conversation - asking for input or performing actions.
      //  This loop will end when the user hits Ctrl+C or performs an action
      //  which triggers termination.
      chatInput = "";
      while (chatInput === "") {
        chatInput = await nextInputOrAction(params, response, messages);
      }
    }
  } catch (err) {
    throw translateError(err);
  }
}
