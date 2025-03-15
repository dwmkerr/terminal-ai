import OpenAI from "openai";
import { ExecutionContext } from "../../lib/execution-context";
import { Configuration } from "../../configuration/configuration";
import { checkLangfuse } from "./check-04-langfuse";
import { checkOpenAIKey } from "./check-01-openai-key";
import { checkOpenAIModel } from "./check-02-openai-model";
import { checkOpenAIRateLimit } from "./check-03-openai-rate-limit";
import { checkConnection } from "./check-00-connection";

export async function check(
  executionContext: ExecutionContext,
  config: Configuration,
) {
  const interactive = executionContext.isTTYstdin;

  //  Create the OpenAI instance we'll use for a lot of the rest of the checks.
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
