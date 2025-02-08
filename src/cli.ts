#!/usr/bin/env node --no-deprecation

import dbg from "debug";
import { Command } from "commander";

import { chat } from "./actions/chat";

import { debug as debugCommand } from "./commands/debug";

import theme from "./theme";
import { TerminatingWarning } from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./lib/execution-context";
import { Configuration, getConfiguration } from "./configuration/configuration";
import { hydrateDefaultConfig } from "./configuration/hydrate-default-config";
import { hydrateContextEnvironmentVariables } from "./lib/hydrate-context-environment-variables";

const ERROR_CODE_WARNING = 1;
const ERROR_CODE_CONNECTION = 2;

const cli = async (
  program: Command,
  executionContext: ExecutionContext,
  config: Configuration,
) => {
  program
    .name("boxes")
    .description("CLI to control your cloud boxes")
    .version(packageJson.version)
    //  'chat' is the default action when no command is specified.
    .option("--no-context-prompts", "Disable context prompts")
    .argument("[input]", "Chat input")
    .action(async (input, { contextPrompts }) => {
      return chat(executionContext, config, input, contextPrompts);
    });

  program
    .command("config")
    .description("Show current configuration")
    .action(async () => {
      console.log(JSON.stringify(config, null, 2));
    });

  program
    .command("debug")
    .description("Additional commands used for debugging")
    .argument("<command>", 'debug command to use, e.g. "test-detach"')
    .argument("<parameters...>", 'parameters for the command, e.g. "one two"')
    .action(async (command, parameters) => {
      const result = await debugCommand(command, parameters);
      console.log(JSON.stringify(result));
    });
};

async function main() {
  //  Create an initial execution context. This may evolve as we run various commands etc.
  //  Make a guess at the interactive mode based on whether the output is a TTY.
  const executionContext: ExecutionContext = {
    isInteractive: process.stdout.isTTY,
    isTTY: process.stdout.isTTY,
  };

  //  Set all of the environment variables that can be used when hydrating
  //  context.
  hydrateContextEnvironmentVariables();

  //  Load our initial configuration, best effort. Allows us to enable debug
  //  tracing if configured.
  const initialConfig = await getConfiguration();
  if (initialConfig.debug.enable) {
    dbg.enable(initialConfig.debug.namespace || "");
  }

  //  Now hydrate and reload our config.
  hydrateDefaultConfig();
  const config = await getConfiguration();

  //  Before we execute the command, we'll make sure we don't show a warning
  //  message if a user closes an inquirer prompt with Ctrl+C.
  process.on("uncaughtException", (error) => {
    console.log(`uncauht exceptin`);
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log("👋 until next time!");
    } else {
      // Rethrow unknown errors
      throw error;
    }
  });

  try {
    const program = new Command();
    await cli(program, executionContext, config);
    await program.parseAsync();
    // TODO(refactor): better error typing.
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    //  TODO: if the 'verbose' flag has been set, log the error object.
    //  Handle inquirer Ctrl+C.
    if (err instanceof Error && err.name === "ExitPromptError") {
      if (executionContext.isInteractive) {
        console.log("Goodbye!");
      }
    } else if (err instanceof TerminatingWarning) {
      theme.printWarning(err.message);
      process.exit(ERROR_CODE_WARNING);
    } else if (err.code === "ENOTFOUND") {
      theme.printError("Address not found - check internet connection");
      process.exit(ERROR_CODE_CONNECTION);
    } else if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      theme.printError("Invalid certificate - check internet connection");
      process.exit(ERROR_CODE_CONNECTION);
    } else {
      throw err;
    }
  }
}
main().catch(console.error);
