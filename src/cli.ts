#!/usr/bin/env -S node --no-deprecation

import path from "path";
import os from "os";
import { execSync } from "child_process";

import { Command } from "commander";

import { chat } from "./commands/chat/chat";
import { debug as debugCommand } from "./commands/debug/debug";
import { config as configCommand } from "./commands/config/config";
import theme from "./theme";
import { ErrorCode } from "./lib/errors";
import packageJson from "../package.json";
import { ExecutionContext } from "./execution-context/execution-context";
import { check } from "./commands/check/check";
import { init } from "./commands/init/init";
import { Commands } from "./commands/commands";
import { translateError } from "./lib/translate-error";
import { createExecutionContext } from "./execution-context/create-execution-context";
import { ConfigurationPaths } from "./configuration/configuration";
import { hydratePromptsFolder } from "./configuration/configuration-prompts-folder";

const cli = async (program: Command, executionContext: ExecutionContext) => {
  //  Collect sting parameters.
  const collect = (value: string, previous: string[]): string[] =>
    previous.concat([value]);

  //  Execute the program.
  program
    .name("ai")
    .description("Effortless AI in the terminal")
    .version(packageJson.version)
    .option("-c, --copy", "Copy output to clipboard and exit")
    .option("-r, --raw", "Do not format or highlight markdown output")
    //  Note the '[]' - this option is an array.
    .option(
      "-f, --file <path>",
      "Path to file(s) to send (multiple files allowed)",
      collect,
      [],
    )
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
    .action(async () => await configCommand(executionContext))
    .addCommand(
      program
        .command("edit")
        .description("edit config file")
        .action(() => {
          const editor = process.env.EDITOR || "vim";
          const path = executionContext.configFilePath;
          try {
            execSync(`${editor} ${path}`, {
              stdio: "inherit",
            });
            console.log(`config file ${path} updated.`);
          } catch (error) {
            console.error(`Error editing ${path}: ${error}`);
          }
        }),
    );

  program
    .command("check")
    .description("Validate configuration")
    .action(async () => {
      await check(executionContext);
    });

  //  The usage command is still very much work in progress.
  // if (executionContext.config.debug.enable) {
  //   program
  //     .command("usage")
  //     .description("View API usage statistics")
  //     .action(async () => {
  //       await usage(executionContext);
  //     });
  // }

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
  //  This is still quite ugly. We are interactive output if force color is set,
  //  or if stdout is a TTY. We actually perform this check again in
  //  createExecutionContext so it could be refactored to be a bit cleaner.
  const forceColor = process.env["FORCE_COLOR"] === "1";
  const isTTYstdout = forceColor || process.stdout.isTTY;

  try {
    //  Hydrate our prompts; this creates the ~/.ai/prompts folder and copies
    //  bundled prompts into it if they don't exist.
    hydratePromptsFolder(
      path.join(__dirname, "..", ConfigurationPaths.PromptsFolder),
      path.join(
        os.homedir(),
        ConfigurationPaths.ConfigFolder,
        ConfigurationPaths.PromptsFolder,
      ),
    );

    //  Build the default config file path and create the execution context.
    const configFilePath = path.join(
      os.homedir(),
      ConfigurationPaths.ConfigFolder,
      ConfigurationPaths.ConfigFile,
    );
    const promptsFolder = path.join(
      os.homedir(),
      ConfigurationPaths.ConfigFolder,
      ConfigurationPaths.PromptsFolder,
    );
    const executionContext = await createExecutionContext(
      process,
      promptsFolder,
      configFilePath,
    );

    //  Now create and execute the program.
    const program = new Command();
    await cli(program, executionContext);
    await program.parseAsync();

    //  We're shutting down, if we have the langfuse itegration wait for it to
    //  flush.
    if (executionContext.integrations?.langfuse?.langfuse) {
      await executionContext.integrations.langfuse.langfuse.shutdownAsync();
    }
  } catch (err) {
    const error = translateError(err);
    //  Note that when we write errors, we format them with colours only if
    //  stdout appears to be a TTY.

    //  Handle inquirer Ctrl+C.
    if (error.errorCode === ErrorCode.ExitPrompt) {
      if (isTTYstdout) {
        console.log("Goodbye!");
      }
    } else {
      //  Handle any other error.
      console.log(
        theme.printError(`${error.name}: ${error.message}`, isTTYstdout),
      );
      return process.exit(error.errorCode);
    }
  }
}
main().catch(console.error);
