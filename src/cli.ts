#!/usr/bin/env -S node --no-deprecation

import dbg from "debug";
import { Command } from "commander";

import { chat } from "./commands/chat/chat";

import { debug as debugCommand } from "./commands/debug";

import theme from "./theme";
import { ErrorCode } from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./lib/execution-context";
import { hydrateDefaultConfig } from "./configuration/hydrate-default-config";
import { hydrateContextEnvironmentVariables } from "./lib/hydrate-context-environment-variables";
import { check } from "./commands/check/check";
import { init } from "./commands/init/init";
import { Commands } from "./commands/commands";
import { usage } from "./commands/usage";
import { readStdin } from "./lib/read-stdin";
import { getDefaultConfiguration } from "./configuration/configuration";
import { getConfiguration } from "./configuration/utils";
import { integrateLangfuse } from "./integrations/langfuse";
import { translateError } from "./lib/translate-error";
const cli = async (program: Command, executionContext: ExecutionContext) => {
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
      const nextCommand = await init(executionContext, true);
      //  The only possible next action is chat or quit.
      if (nextCommand === Commands.Chat) {
        return chat(
          { ...executionContext },
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
      console.log(JSON.stringify(executionContext.config, null, 2));
    });

  program
    .command("check")
    .description("Validate configuration")
    .action(async () => {
      await check(executionContext);
    });

  //  The usage command is still very much work in progress.
  if (executionContext.config.debug.enable) {
    program
      .command("usage")
      .description("View API usage statistics")
      .action(async () => {
        //  TODO: better just to open: https://platform.openai.com/usage
        await usage(executionContext);
      });
  }

  program
    .command("debug")
    .description("Additional commands used for debugging")
    .argument("<command>", 'debug command to use, e.g. "test-detach"')
    .argument("[parameters...]", 'parameters for the command, e.g. "one two"')
    .action(async (command, parameters) => {
      const result = await debugCommand(executionContext, command, parameters);
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
    //  We will very shortly enrich the config.
    config: getDefaultConfiguration(),
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
      dbg.enable(initialConfig.debug.namespace || "");
      dbg.log(`initialisiing and hydrating config...`);
    }

    //  Now hydrate and reload our config.
    hydrateDefaultConfig();
    executionContext.config = await getConfiguration();

    //  Enable any integrations.
    executionContext.integrations = {
      langfuse: integrateLangfuse(executionContext.config),
    };

    //  Now create and execute the program.
    const program = new Command();
    await cli(program, executionContext);
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
