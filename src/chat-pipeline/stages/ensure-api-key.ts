import dbg from "debug";

import { ExecutionContext } from "../../lib/execution-context";
import {
  ERROR_CODE_INVALID_CONFIFGURATION,
  TerminatingError,
} from "../../lib/errors";
import { Configuration } from "../../configuration/configuration";
import { init } from "../../actions/init";
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

  //  We don't have a key, if we're not interactive on stdin we cannot continue.
  //  Note that the error message will be in the output, so keep it short.
  if (!executionContext.isTTYstdin) {
    throw new TerminatingError(
      "error: OpenAI API Key not set",
      ERROR_CODE_INVALID_CONFIFGURATION,
    );
  }

  //  If we don't have an API key, we can init for one.
  console.log(
    `Welcome to Terminal AI!

An API key must be configured so that Terminal AI can talk to ChatGPT.
Enter your key below, or for instructions check:
  https://github.com/dwmkerr/terminal-ai#api-key
`,
  );
  const { updatedConfig } = await init(executionContext, config, false);
  return updatedConfig;
}
