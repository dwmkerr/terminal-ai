import OpenAI from "openai";
import { parseInput } from "./stages/parse-input";
import { ChatPipelineParameters } from "./ChatPipelineParameters";
import { initialInput } from "./stages/initial-input";
import { buildContext } from "./stages/build-context";
import { buildOutputIntentContext } from "./stages/build-output-intent-context";
import { getCompletionsResponse } from "./stages/get-response";
import { copyResponse } from "./stages/copy-response";
import { printResponse } from "./stages/print-response";
import { nextInputOrAction } from "./stages/next-input-or-action";
import { parseResponse } from "./stages/parse-response";
import { getProviderPrompt } from "../providers/get-provider-prompt";
import { loadAndAppendInputFiles } from "./stages/load-and-append-input-files";

export async function executeChatPipeline(parameters: ChatPipelineParameters) {
  //  Ensure we have the required configuration.
  const { executionContext, chatContext } = parameters;
  const config = parameters.executionContext.config;
  const params = { ...parameters, config };
  const openai = new OpenAI({
    apiKey: parameters.executionContext.provider.apiKey,
    baseURL: parameters.executionContext.provider.baseURL,
  });

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
    //  Deconstruct our chat input into a message and intent. Load any files.
    const inputAndIntentMsg = parseInput(chatInput);
    const inputAndIntent = await loadAndAppendInputFiles(
      executionContext.process.stdin,
      params.chatContext,
      inputAndIntentMsg,
      params.executionContext.isTTYstdout,
    );

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

    const rawMarkdownResponse = await getCompletionsResponse(
      params,
      openai,
      chatContext.messages,
    );
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

    //  Add the response to the chat history.
    chatContext.messages.push({
      role: "assistant",
      content: response.rawMarkdownResponse,
    });

    //  We continue the conversation - asking for input or performing actions.
    //  This loop will end when the user hits Ctrl+C or performs an action
    //  which triggers termination.
    chatInput = "";
    while (chatInput === "") {
      chatInput = await nextInputOrAction(
        params,
        response,
        chatContext.messages,
      );
    }
  }
}
