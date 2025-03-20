import OpenAI from "openai";
import { ExecutionContext } from "../../lib/execution-context";
import { checkLangfuse } from "./check-04-langfuse";
import { checkOpenAIKey } from "./check-01-openai-key";
import { checkOpenAIModel } from "./check-02-openai-model";
import { checkOpenAIRateLimit } from "./check-03-openai-rate-limit";
import { checkConnection } from "./check-00-connection";

export async function check(executionContext: ExecutionContext) {
  const interactive = executionContext.isTTYstdin;
  const config = executionContext.config;

  //  Create the OpenAI instance we'll use for a lot of the rest of the checks.
  console.log("bu", config.openai.baseURL);
  console.log("ai", config.openAiApiKey);
  const openai = new OpenAI({
    baseURL: config.openai.baseURL,
    apiKey: config.openAiApiKey,
  });

  await checkConnection(interactive);
  //  TODO base url?
  await checkOpenAIKey(interactive, openai, config.openAiApiKey);
  await checkOpenAIModel(interactive, openai, config.openai.model);
  await checkOpenAIRateLimit(interactive, openai, config.openai.model);

  await checkLangfuse(executionContext);
}
