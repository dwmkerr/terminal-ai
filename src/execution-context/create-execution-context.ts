import debug from "debug";
import { ExecutionContext, ProcessLike } from "./execution-context";
import { hydrateContextEnvironmentVariables } from "../lib/hydrate-context-environment-variables";
import { integrateLangfuse } from "../integrations/langfuse";
import { loadConfiguration } from "../configuration/load-configuration";
import { isFirstRun } from "./is-first-run";
import { buildProviderFromConfig } from "./build-provider";

const dbg = debug("ai:create-execution-context");

export async function createExecutionContext(
  process: ProcessLike,
  promptsFolder: string,
  configFilePath: string,
): Promise<ExecutionContext> {
  //  Create an initial execution context. This may evolve as we run various commands etc.
  //  Make a guess at the interactive mode based on whether the output is a TTY.
  //  The 'colors.js' force color we will also use.
  const forceColor = process.env["FORCE_COLOR"] === "1";

  //  Set all of the environment variables that can be used when hydrating
  //  context.
  hydrateContextEnvironmentVariables(process.env);

  //  Load our configuration.
  const config = await loadConfiguration(
    promptsFolder,
    configFilePath,
    process.env,
  );
  if (config.debug.enable) {
    debug.enable(config.debug.namespace || "");
    dbg(`initialisiing and hydrating config...`);
  }

  //  Create the execution context.
  const provider = buildProviderFromConfig(config);
  const executionContext: ExecutionContext = {
    process,
    //  We've got the config file and it's path...
    configFilePath,
    config,
    //  ...the provider, which is a function of the config...
    provider: provider,
    //  ...the first run, which is a function of the provider...
    isFirstRun: isFirstRun(provider),
    //  ...and state from the stdin/stdout streams.
    isTTYstdin: process.stdin.isTTY || false,
    isTTYstdout: forceColor || process.stdout.isTTY || false,
  };

  //  Enable any integrations.
  executionContext.integrations = {
    langfuse: integrateLangfuse(executionContext.config),
  };

  return executionContext;
}
