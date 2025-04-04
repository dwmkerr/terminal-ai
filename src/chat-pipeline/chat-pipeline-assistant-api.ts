import OpenAI from "openai";
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

export async function executeChatPipeline(parameters: ChatPipelineParameters) {
  //  Ensure we have the required configuration.
  const executionContext = parameters.executionContext;
  const config = executionContext.config;
  const params = { ...parameters, config };
  const openai = new OpenAI({
    apiKey: parameters.executionContext.provider.apiKey,
    baseURL: parameters.executionContext.provider.baseURL,
  });

  //  Create the assistant.
  try {
    const assistant = await createAssistant(openai, params.executionContext);

    //  Get all context prompts and add them to a new thread.
    const contextPrompts = await buildContext(params, process.env);
    const thread = await openai.beta.threads.create({
      messages: contextPrompts.map((c) => ({
        role: "user",
        content: c.context,
      })),
    });

    //  Determine our initial input. Might be from the command line params, user
    //  entry, stdin, etc...
    let chatInput = await initialInput(params);

    //  Repeatedly interact with ChatGPT as long as we have chat input.
    while (chatInput !== "") {
      //  Deconstruct our chat input into a message and intent. Load any files.
      const inputAndIntentMsg = parseInput(chatInput);
      const inputAndIntent = await loadAndAppendInputFiles(
        executionContext.process.stdin,
        params.chatContext,
        inputAndIntentMsg,
        params.executionContext.isTTYstdout,
      );

      //  Create all output intent prompts.
      //  Add them as messages to the thread.
      const outputPrompts = await buildOutputIntentContext(
        params,
        process.env,
        inputAndIntent.outputIntent,
      );
      if (outputPrompts.length > 0) {
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: outputPrompts.map((p) => ({
            type: "text",
            text: p.context,
          })),
        });
      }

      //  Add the user's message and get the response. The prompt will be
      //  something like 'chatgpt' or 'gemini'.
      const prompt = getProviderPrompt(params.executionContext.provider);
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: inputAndIntent.message,
      });
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
      //  handles this for us.

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
