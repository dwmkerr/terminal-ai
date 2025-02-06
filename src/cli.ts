#!/usr/bin/env node

import dbg from "debug";
import { Command } from "commander";

import { config } from "./commands/config";
import { debug } from "./commands/debug";
import { getCosts } from "./commands/getCosts";
import { info } from "./commands/info";
import { list } from "./commands/list";
import { run } from "./commands/run";
import { start } from "./commands/start";
import { stop } from "./commands/stop";

import theme from "./theme";
import { TerminatingWarning } from "./lib/errors";
import packageJson from "../package.json";
import { BoxState } from "./box";
import { assertConfirmation, execCommand } from "./lib/cli-helpers";
import { BoxesConfiguration, getConfiguration } from "./lib/configuration";
import { importBox } from "./commands/import";

const ERROR_CODE_WARNING = 1;
const ERROR_CODE_CONNECTION = 2;

const cli = async (program: Command, configuration: BoxesConfiguration) => {
  program
    .name("boxes")
    .description("CLI to control your cloud boxes")
    .version(packageJson.version);

  program
    .command("list")
    .alias("ls")
    .description("Show boxes")
    .action(async () => {
      const boxes = await list();
      boxes.forEach((box) => {
        theme.printBoxHeading(box.boxId, box.state);
        theme.printBoxDetail("Name", box.name || "<unknown>");
        //  Only show DNS details if they exist (i.e. if the box is running).
        if (box.instance?.PublicDnsName && box.instance?.PublicIpAddress) {
          theme.printBoxDetail("DNS", box.instance.PublicDnsName);
          theme.printBoxDetail("IP", box.instance.PublicIpAddress);
        }
        if (box.hasArchivedVolumes) {
          theme.printBoxDetail("Archived Volumes", "true");
        }
      });
    });

  program
    .command("info")
    .description("Show detailed info on a box")
    .argument("<boxId>", 'id of the box, e.g: "steambox"')
    .action(info);

  program
    .command("run")
    .description("Run a command on a box")
    .argument("<boxId>", 'id of the box, e.g: "steambox"')
    .argument("<commandName>", 'command name, e.g: "ssh"')
    .argument("[args...]", "command arguments")
    .option("-e, --exec", "execute command", false)
    .option("-c, --copy-command", "copy command to clipboard", false)
    .action(async (boxId, commandName, args, options) => {
      const { command, copyCommand } = await run({
        boxId,
        commandName,
        copyCommand: options.copyCommand,
        args: args,
      });
      console.log(`${commandName}:`);
      console.log(`  ${command}`);
      if (options.copyCommand) {
        console.log();
        console.log(`Copied to clipboard: ${copyCommand}`);
      }
      if (options.exec) {
        execCommand(command);
      }
    });

  program
    .command("start")
    .description("Start a box")
    .argument("<boxId>", 'id of the box, e.g: "steambox"')
    .option("-w, --wait", "wait for box to complete startup", false)
    .option(
      "-y, --yes",
      "[experimental] confirm restore archived volumes",
      false,
    )
    .action(async (boxId, options) => {
      const { instanceId, currentState, previousState } = await start({
        boxId,
        wait: options.wait,
        restoreArchivedVolumes: options.yes,
      });
      console.log(
        `  ${theme.boxId(boxId)} (${instanceId}): ${theme.state(
          previousState,
        )} -> ${theme.state(currentState)}`,
      );
    });

  program
    .command("stop")
    .description("Stop a box")
    .argument("<boxId>", 'id of the box, e.g: "steambox"')
    .option("-w, --wait", "wait for box to complete startup", false)
    .option(
      "-a, --archive-volumes",
      "[experimental] archive volumes",
      configuration.archiveVolumesOnStop || false,
    )
    .option("-y, --yes", "confirm archive volumes", false)
    .action(async (boxId, options) => {
      console.log("archive is: ", configuration.archiveVolumesOnStop);

      //  If archiving, demand confirmation.
      if (options.archiveVolumes && !options.yes) {
        await assertConfirmation(
          options,
          "yes",
          `The '--archive-volumes' feature is experimental and may cause data loss.
To accept this risk, re-run with the '--yes' parameter.`,
        );
      }
      const { instanceId, currentState, previousState } = await stop({
        boxId,
        wait: options.wait,
        archiveVolumes: options.archiveVolumes,
      });
      console.log(
        `  ${theme.boxId(boxId)} (${instanceId}): ${theme.state(
          previousState,
        )} -> ${theme.state(currentState)}`,
      );
    });

  program
    .command("costs")
    .description("Check box costs")
    .option("-y, --yes", "accept AWS charges", false)
    .option("-y, --year <year>", "month of year", undefined)
    .option("-m, --month <month>", "month of year", undefined)
    .action(async (options) => {
      //  Demand confirmation.
      await assertConfirmation(
        options,
        "yes",
        `The AWS cost explorer charges $0.01 per call.
To accept charges, re-run with the '--yes' parameter.`,
      );

      const boxes = await list();
      const costs = await getCosts({
        yes: options.yes,
        year: options.year,
        month: options.month,
      });

      //  Show each box, joined to costs.
      boxes.forEach((box) => {
        //  TODO refactor typescript
        if (box.boxId !== undefined) {
          theme.printBoxHeading(box.boxId, box.state);
          const boxCosts = costs[box.boxId];
          theme.printBoxDetail("Costs (this month)", boxCosts || "<unknown>");
          delete costs[box.boxId];
        }
      });

      //  Any costs we didn't map should be found.
      Object.getOwnPropertyNames(costs).forEach((key) => {
        const cost = costs[key];
        if (key === "*") {
          theme.printBoxHeading("Non-box costs");
        } else {
          theme.printBoxHeading(key, BoxState.Unknown);
        }
        theme.printBoxDetail("Costs (this month)", cost);
      });
    });

  program
    .command("config")
    .description("Show current configuration")
    .action(async () => {
      const configuration = await config();
      console.log(JSON.stringify(configuration, null, 2));
    });

  program
    .command("debug")
    .description("Additional commands used for debugging")
    .argument("<command>", 'debug command to use, e.g. "test-detach"')
    .argument("<parameters...>", 'parameters for the command, e.g. "one two"')
    .action(async (command, parameters) => {
      const result = await debug(command, parameters);
      console.log(JSON.stringify(result));
    });

  program
    .command("import")
    .description("Import an AWS instance and volumes and tag as a Box")
    .argument("<instanceId>", "the aws instance id")
    .argument("<boxId>", "the box id to tag the instance with")
    .option("-o, --overwrite", "overwrite existing box tags", false)
    .action(async (instanceId, boxId, options) => {
      await importBox({
        boxId,
        instanceId,
        overwrite: options.overwrite,
      });
      console.log(
        `  ${theme.boxId(boxId)} (${instanceId}): imported successfully`,
      );
    });
};

async function main() {
  try {
    const configuration = await getConfiguration();

    //  We will quickly check configuration for debug tracing. If it throws we
    //  will ignore for now, as later error handling will show the proper error
    //  output to the user.
    try {
      if (configuration.debugEnable) {
        dbg.enable(configuration.debugEnable);
      }
    } catch {
      // no-op
    }

    const program = new Command();
    await cli(program, configuration);
    await program.parseAsync();
    // TODO(refactor): better error typing.
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    //  TODO: if the 'verbose' flag has been set, log the error object.
    if (err instanceof TerminatingWarning) {
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
