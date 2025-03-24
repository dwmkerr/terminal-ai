#!/usr/bin/env -S node --no-deprecation

import { Command } from "commander";

import { chat } from "./commands/chat/chat";

import { debug as debugCommand } from "./commands/debug";
import { config as configCommand } from "./commands/config/config";

import theme from "./theme";
import { ErrorCode } from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./execution-context/execution-context";
import { check } from "./commands/check/check";
import { init } from "./commands/init/init";
import { Commands } from "./commands/commands";
import { usage } from "./commands/usage";
import { translateError } from "./lib/translate-error";
import { ensureApiKey } from "./chat-pipeline/stages/ensure-api-key";
import { createExecutionContext } from "./execution-context/create-execution-context";

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
        await ensureApiKey(executionContext);
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
    .action(async () => await configCommand(executionContext));

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
  const executionContext = await createExecutionContext(process);

  try {
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
