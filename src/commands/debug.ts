import os from "os";
import * as config from "../configuration/configuration";
import * as constants from "../lib/constants";
import path from "path";
import { TerminatingWarning } from "../lib/errors";
import {
  getDetachableVolumes,
  restoreArchivedVolumes,
  archiveVolumes,
} from "../lib/volumes";
import { default_format } from "openai/internal/qs/formats.mjs";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function logJson(val: any) {
  console.log(JSON.stringify(val, null, 2));
}

export async function debug(command: string, parameters: string[]) {
  console.log(`debug: command - ${command} with parameters ${parameters}`);
  if (command === "config") {
    console.log("debug: config");
    const configPath = path.join(os.homedir(), constants.configFilePath);
    const defaultConfig = config.getDefaultConfiguration();
    const fileConfig = config.getConfigurationFromFile(configPath);
    const envConfig = config.getConfigurationFromEnv(process.env);
    console.log(`default:`, defaultConfig);
    console.log(`file:`, fileConfig);
    console.log(`env:`, envConfig);
    const cfg = await config.getConfiguration();
    console.log(`unified config:`, cfg);
    return;
  } else if (command === "test-detach-snapshot-tag") {
    console.log("debug: test-detach");
    const instanceId = parameters[0];
    if (!instanceId) {
      console.error("instanceid is required as the first parameter");
      return;
    }

    const tags = [{ Key: "boxes.boxid", Value: "debug" }];
    console.log("Getting detachable volumes...");
    const detachableVolumes = await getDetachableVolumes(instanceId);
    logJson(detachableVolumes);
    console.log("Snapshotting / tagging...");
    const result = await archiveVolumes(instanceId, detachableVolumes, tags);
    logJson(result);

    return result;
  } else if (command === "test-restore-volumes") {
    console.log("debug: test-restore-volumes");
    const instanceId = parameters[0];
    if (!instanceId) {
      console.error("instanceid is required as the first parameter");
      return;
    }
    const result = await restoreArchivedVolumes(instanceId);
    console.log(result);
  } else {
    throw new TerminatingWarning(`unknown debug command ${command}`);
  }
  return {};
}
