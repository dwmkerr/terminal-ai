#!/usr/bin/env -S node --no-deprecation

import fs from "fs";
import dbg from "debug";
import { Command } from "commander";

import { chat } from "./actions/chat";

import { debug as debugCommand } from "./commands/debug";

import theme from "./theme";
import { ErrorCode } from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./lib/execution-context";
import { hydrateDefaultConfig } from "./configuration/hydrate-default-config";
import { hydrateContextEnvironmentVariables } from "./lib/hydrate-context-environment-variables";
import { check } from "./commands/check/check";
import { init } from "./actions/init";
import { Actions } from "./actions/actions";
import { usage } from "./commands/usage";
import { readStdin } from "./lib/read-stdin";
import { Configuration } from "./configuration/configuration";
import { configFilePath, getConfiguration } from "./configuration/utils";
import { integrateLangfuse } from "./integrations/langfuse";
import { translateError } from "./lib/translate-error";
const cli = async (
  program: Command,
  executionContext: ExecutionContext,
  config: Configuration,
) => {
  //  Collect sting parameters.
  const collect = (value: string, previous: string[]): string[] =>
    previous.concat([value]);

  //  Execute the program.
  program
    .name("ai")
    .description("Effortless AI in the terminal")
    .version(packageJson.version)
    //  Note the '[]' - this option is an array.
    .option(
      "-f, --file <path>",
      "File to upload (can be used multiple times",
      collect,
      [],
    )
    .option("-c, --copy", "Copy output to clipboard and exit")
    .option("-r, --raw", "Do not format or highlight markdown output")
    .option("--assistant", "Experimental. Use the OpenAI Assistants API")
    .option("--no-context-prompts", "Disable context prompts")
    .option("--no-output-prompts", "Disable output prompts")
    .argument("[input]", "Chat input")
    //  'chat' is the default action when no command is specified.
    .action(
      async (
        input,
        { contextPrompts, outputPrompts, copy, raw, assistant, file },
      ) => {
        return chat(
          executionContext,
          config,
          input,
          contextPrompts,
          outputPrompts,
          copy,
          raw,
          assistant,
          file,
        );
      },
    );

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
          false,
          false,
          [],
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

  //  The usage command is still very much work in progress.
  if (config.debug.enable) {
    program
      .command("usage")
      .description("View API usage statistics")
      .action(async () => {
        //  TODO: better just to open: https://platform.openai.com/usage
        await usage(executionContext, config);
      });
  }

  program
    .command("debug")
    .description("Additional commands used for debugging")
    .argument("<command>", 'debug command to use, e.g. "test-detach"')
    .argument("[parameters...]", 'parameters for the command, e.g. "one two"')
    .action(async (command, parameters) => {
      const result = await debugCommand(
        executionContext,
        config,
        command,
        parameters,
      );
      console.log(JSON.stringify(result));
    });
};

async function main() {
  //  If we have anything piped to stdin, read it.
  const stdinContent = await readStdin(process.stdin);

  //  Create an initial execution context. This may evolve as we run various commands etc.
  //  Make a guess at the interactive mode based on whether the output is a TTY.
  //  The 'colors.js' force color we will also use.
  const forceColor = process.env["FORCE_COLOR"] === "1";
  const executionContext: ExecutionContext = {
    firstTime: fs.existsSync(configFilePath),
    isTTYstdin: process.stdin.isTTY || false,
    isTTYstdout: forceColor || process.stdout.isTTY || false,
    stdinContent,
  };

  //  Before we execute the command, we'll make sure we don't show a warning
  //  message if a user closes an inquirer prompt with Ctrl+C.
  process.on("uncaughtException", (error) => {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log("👋 until next time!");
    } else {
      // Rethrow unknown errors
      throw error;
    }
  });

  try {
    //  Set all of the environment variables that can be used when hydrating
    //  context.
    hydrateContextEnvironmentVariables();

    //  Load our initial configuration, best effort. Allows us to enable debug
    //  tracing if configured.
    const initialConfig = await getConfiguration();
    if (initialConfig.debug.enable) {
      dbg.enable(initialConfig.debug.namespace || "");
      dbg.log(`initialisiing and hydrating config...`);
    }

    //  Now hydrate and reload our config.
    hydrateDefaultConfig();
    const config = await getConfiguration();

    //  Enable any integrations.
    executionContext.integrations = {
      langfuse: integrateLangfuse(config),
    };

    //  Now create and execute the program.
    const program = new Command();
    await cli(program, executionContext, config);
    await program.parseAsync();
  } catch (err) {
    const error = translateError(err);
    //  Note that when we write errors, we format them with colours only if
    //  stdout appears to be a TTY.

    //  Handle inquirer Ctrl+C.
    if (error.errorCode === ErrorCode.ExitPrompt) {
      if (executionContext.isTTYstdout) {
        console.log("Goodbye!");
      }
    } else if (error.errorCode === ErrorCode.Warning) {
      //  Handle warnings - they don't fail the app but do close it.
      console.log(
        theme.printWarning(error.message, executionContext.isTTYstdout),
      );
      //  Note: warnings do *not* fail the app, but this is likely a bad pattern.
      return process.exit(0);
    } else {
      //  Handle any other error.
      console.log(
        theme.printError(
          `${error.name}: ${error.message}`,
          executionContext.isTTYstdout,
        ),
      );
      return process.exit(error.errorCode);
    }
  }

  //  We're shutting down, if we have the langfuse itegration wait for it to
  //  flush.
  if (executionContext.integrations?.langfuse?.langfuse) {
    await executionContext.integrations.langfuse.langfuse.shutdownAsync();
  }
}
main().catch(console.error);
