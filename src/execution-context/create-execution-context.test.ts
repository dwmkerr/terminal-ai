import os from "os";
import fs from "fs";
import path from "path";
import { createExecutionContext } from "./create-execution-context";
import {
  ConfigurationPaths,
  getDefaultConfiguration,
} from "../configuration/configuration";

export interface StdStreamLike {
  isTTY: boolean;
  on: (
    event: string,
    listener: (data: Buffer) => void,
  ) => StdStreamLike | undefined;
}

export interface ProcessLike {
  stdin: StdStreamLike;
  stdout: StdStreamLike;
  env: NodeJS.ProcessEnv;
}
describe("execution-context", () => {
  let tempConfigFolder: string;
  let tempConfigFilePath: string;
  let tempConfigPromptsFolder: string;
  let expectedEnrichedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempConfigFolder = fs.mkdtempSync(`ai-tests`);
    tempConfigFilePath = path.join(
      tempConfigFolder,
      ConfigurationPaths.ConfigFolder,
      ConfigurationPaths.ConfigFile,
    );
    tempConfigPromptsFolder = path.join(
      tempConfigFolder,
      ConfigurationPaths.ConfigFolder,
      ConfigurationPaths.PromptsFolder,
      ConfigurationPaths.ConfigFile,
    );
    expectedEnrichedEnv = {
      OS_PLATFORM: os.platform(),
      TTY_WIDTH: `${process.stdout.columns || 80}`,
      TTY_HEIGHT: `${process.stdout.rows || 24}`,
    };
  });

  afterEach(() => {
    fs.rmdirSync(tempConfigFolder, { recursive: true });
  });

  describe("createExecutionContext", () => {
    test("creates correctly with no config file or prompts folder present", async () => {
      const process: ProcessLike = {
        stdin: {
          on: () => undefined,
          isTTY: true,
        },
        stdout: {
          on: () => undefined,
          isTTY: false,
        },
        env: {},
      };
      const executionContext = await createExecutionContext(
        process,
        tempConfigFilePath,
        tempConfigPromptsFolder,
      );

      //  Check for the expected execution context.
      expect(executionContext).toMatchObject({
        config: getDefaultConfiguration(),
        isTTYstdin: true,
        isTTYstdout: false,
      });
      //  Also check that the environment has been hydrated.
      expect(process.env).toMatchObject(expectedEnrichedEnv);
    });
  });
});
