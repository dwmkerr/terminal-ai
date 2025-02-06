import os from "os";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { TerminatingWarning } from "./errors";

export interface BoxConfiguration {
  connectUrl?: string;
  username?: string;
  password?: string;
  sshCommand?: string;
  commands?: Record<string, CommandConfiguration>;
}

export interface CommandConfiguration {
  command: string;
  copyCommand?: string;
  parameters?: Record<string, string>;
}

export interface AwsConfiguration {
  region?: string;
}

export interface BoxesConfiguration {
  boxes?: Record<string, BoxConfiguration>;
  aws?: AwsConfiguration;
  commands?: Record<string, CommandConfiguration>;
  archiveVolumesOnStop?: boolean;
  debugEnable?: string;
}

export async function getConfiguration(): Promise<BoxesConfiguration> {
  //  For now, box config is hard coded to the current location.
  const boxConfigPaths = [
    path.join(path.resolve(), "./boxes.json"),
    path.join(os.homedir(), ".boxes.json"),
  ];
  const candidates = boxConfigPaths.find(fs.existsSync);
  if (!candidates) {
    throw new TerminatingWarning(`Failed to find config at: ${boxConfigPaths}`);
  }
  const boxConfigPath = boxConfigPaths[0];

  //  Mock-fs doesn't mock UTF-8 properly in Node 20, so skip the parameter
  //  and manually toString the result...
  //  https://github.com/tschaub/mock-fs/issues/377
  const data = await fsPromises.readFile(boxConfigPath, "utf8");
  const json = JSON.parse(data);

  //  Map the boxes configuration.
  const boxes = Object.getOwnPropertyNames(json?.boxes).reduce(
    (acc: Record<string, BoxConfiguration>, boxId: string) => {
      acc[boxId] = {
        connectUrl: json?.boxes?.[boxId]?.connectUrl,
        username: json?.boxes?.[boxId]?.username,
        password: json?.boxes?.[boxId]?.password,
        sshCommand: json?.boxes?.[boxId]?.sshCommand,
        commands: json?.boxes?.[boxId]?.commands,
      };
      return acc;
    },
    {},
  );

  return {
    boxes,
    aws: {
      region: json?.aws?.region,
    },
    commands: json?.commands,
    archiveVolumesOnStop: json?.archiveVolumesOnStop,
    debugEnable: json?.debugEnable,
  };
}
