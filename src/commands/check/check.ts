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
  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  await checkConnection(interactive);
  //  TODO base url?
  await checkOpenAIKey(interactive, openai, config.apiKey);
  await checkOpenAIModel(interactive, openai, config.model);
  await checkOpenAIRateLimit(interactive, openai, config.model);

  await checkLangfuse(executionContext);
}
