import * as readline from "readline";
import { chat as chatCommand } from "../commands/chat";
import { ExecutionContext } from "../lib/execution-context";
import { TerminatingWarning } from "../lib/errors";
import { Configuration } from "../configuration/configuration";
import { ensureApiKey } from "./ensure-api-key";

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
) {
  // This will run when no command is specified
  if (!executionContext.isInteractive) {
    throw new TerminatingWarning(
      "Chat is not supported in non-interactive mode",
    );
  }

  //  If we don't have an API key, ask for one.
  const cfg = await ensureApiKey(executionContext, config);

  const rl = readline.promises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const input = await rl.question("chat: ");
  await chatCommand(cfg.openAiApiKey, input);
}
