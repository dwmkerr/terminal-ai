import dbg from "debug";
import { input } from "@inquirer/prompts";

import { ExecutionContext } from "../lib/execution-context";
import { TerminatingWarning } from "../lib/errors";
import { Configuration, saveApiKey } from "../configuration/configuration";

const debug = dbg("ai:ensure-api-key");

export async function ensureApiKey(
  executionContext: ExecutionContext,
  config: Configuration,
): Promise<Configuration> {
  //  If we already have a key, we're done.
  if (config.openAiApiKey !== "") {
    debug("key already configured");
    return config;
  }

  //  We don't have a key, if we're not interactive we cannot continue.
  //  Note that the error message will be in the output, so keep it short.
  if (!executionContext.isInteractive) {
    throw new TerminatingWarning("error: openAiApiKey is not set");
  }

  //  If we don't have an API key, ask for one.
  console.log(
    `Welcome to Terminal AI!

An API key must be configured so that Terminal AI can talk to ChatGPT.
Enter your key below, or for instructions check:
  https://github.com/dwmkerr/terminal-ai#api-key
`,
  );
  const apiKey = await input({ message: "API Key:" });
  saveApiKey(apiKey);

  //  Return the enriched configuration.
  debug("key read and saved");
  return {
    ...config,
    openAiApiKey: apiKey,
  };
}
