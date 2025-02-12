#!/usr/bin/env node --no-deprecation

import fs from "fs";
import dbg from "debug";
import { Command } from "commander";

import { chat } from "./actions/chat";

import { debug as debugCommand } from "./commands/debug";

import theme from "./theme";
import {
  ERROR_CODE_CONNECTION,
  TerminatingError,
  TerminatingWarning,
} from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./lib/execution-context";
import {
  configFilePath,
  Configuration,
  getConfiguration,
} from "./configuration/configuration";
import { hydrateDefaultConfig } from "./configuration/hydrate-default-config";
import { hydrateContextEnvironmentVariables } from "./lib/hydrate-context-environment-variables";
import { check } from "./actions/check";
import { init } from "./actions/init";
import { Actions } from "./actions/actions";
const cli = async (
  program: Command,
  executionContext: ExecutionContext,
  config: Configuration,
) => {
  program
    .name("ai")
    .description("Effortless AI in the terminal")
    .version(packageJson.version)
    //  'chat' is the default action when no command is specified.
    .option("-c, --copy", "Copy output to clipboard and exit")
    .option("--no-context-prompts", "Disable context prompts")
    .option("--no-output-prompts", "Disable output prompts")
    .argument("[input]", "Chat input")
    .action(async (input, { contextPrompts, outputPrompts, copy }) => {
      return chat(
        executionContext,
        config,
        input,
        contextPrompts,
        outputPrompts,
        copy,
      );
    });

  program
    .command("init")
    .description("Set or update configuration")
    .action(async () => {
      const { nextAction, updatedConfig } = await init(
        executionContext,
        config,
        true,
      );
      //  The only possible next action is chat or quit.
      if (nextAction === Actions.Chat) {
        return chat(
          executionContext,
          updatedConfig,
          undefined,
          true,
          true,
          false,
        );
      }
    });

  program
    .command("config")
    .description("Show current configuration")
    .action(async () => {
      console.log(JSON.stringify(config, null, 2));
    });

  program
    .command("check")
    .description("Validate configuration")
    .action(async () => {
      await check(executionContext, config);
    });

  program
    .command("debug")
    .description("Additional commands used for debugging")
    .argument("<command>", 'debug command to use, e.g. "test-detach"')
    .argument("[parameters...]", 'parameters for the command, e.g. "one two"')
    .action(async (command, parameters) => {
      const result = await debugCommand(command, parameters);
      console.log(JSON.stringify(result));
    });
};

async function main() {
  //  Create an initial execution context. This may evolve as we run various commands etc.
  //  Make a guess at the interactive mode based on whether the output is a TTY.
  const executionContext: ExecutionContext = {
    firstTime: fs.existsSync(configFilePath),
    isInteractive: process.stdout.isTTY || false,
    isTTY: process.stdout.isTTY || false,
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
      console.log(
        theme.printWarning(err.message, executionContext.isInteractive),
      );
    } else if (err instanceof TerminatingError) {
      console.log(
        theme.printError(err.message, executionContext.isInteractive),
      );
      process.exit(err.errorCode);
    } else if (err.code === "ENOTFOUND") {
      console.log(
        theme.printError(
          "Address not found - check internet connection",
          executionContext.isInteractive,
        ),
      );
      process.exit(ERROR_CODE_CONNECTION);
    } else if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      console.log(
        theme.printError(
          "Invalid certificate - check internet connection",
          executionContext.isInteractive,
        ),
      );
      process.exit(ERROR_CODE_CONNECTION);
    } else {
      throw err;
    }
  }
}
main().catch(console.error);
