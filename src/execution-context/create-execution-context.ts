import debug from "debug";
import { getDefaultConfiguration } from "../configuration/configuration";
import { getConfiguration } from "../configuration/utils";
import { ExecutionContext } from "./execution-context";
import { hydrateContextEnvironmentVariables } from "../lib/hydrate-context-environment-variables";
import { readStdin } from "../lib/read-stdin";
import { hydrateDefaultConfig } from "../configuration/hydrate-default-config";
import { integrateLangfuse } from "../integrations/langfuse";
import { translateError } from "../lib/translate-error";
import { ProcessLike } from "./create-execution-context.test";

const dbg = debug("ai:create-execution-context");

export async function createExecutionContext(
  process: ProcessLike,
): Promise<ExecutionContext> {
  //  If we have anything piped to stdin, read it.
  const stdinContent = await readStdin(process.stdin);

  //  Create an initial execution context. This may evolve as we run various commands etc.
  //  Make a guess at the interactive mode based on whether the output is a TTY.
  //  The 'colors.js' force color we will also use.
  const forceColor = process.env["FORCE_COLOR"] === "1";
  const executionContext: ExecutionContext = {
    //  We will very shortly enrich the config.
    config: getDefaultConfiguration(),
    //  TOOD
    provider: { name: "", baseURL: "", apiKey: "", model: "" },
    isTTYstdin: process.stdin.isTTY || false,
    isTTYstdout: forceColor || process.stdout.isTTY || false,
    stdinContent,
  };

  try {
    //  Set all of the environment variables that can be used when hydrating
    //  context.
    hydrateContextEnvironmentVariables();

    //  Load our initial configuration, best effort. Allows us to enable debug
    //  tracing if configured.
    const initialConfig = await getConfiguration();
    if (initialConfig.debug.enable) {
      debug.enable(initialConfig.debug.namespace || "");
      dbg.log(`initialisiing and hydrating config...`);
    }

    //  Now hydrate and reload our config.
    hydrateDefaultConfig();
    executionContext.config = await getConfiguration();

    //  Enable any integrations.
    executionContext.integrations = {
      langfuse: integrateLangfuse(executionContext.config),
    };

    return executionContext;
  } catch (err) {
    throw translateError(err);
  }
}
