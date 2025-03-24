import os from "os";
import fs from "fs";
import path from "path";
import { createExecutionContext } from "./create-execution-context";
import {
  ConfigurationPaths,
  getDefaultConfiguration,
} from "../configuration/configuration";
import { ProcessLike } from "./execution-context";

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
    it("creates correctly with no config file or prompts folder present", async () => {
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
        tempConfigPromptsFolder,
        tempConfigFilePath,
      );

      //  Check for the expected execution context.
      expect(executionContext).toStrictEqual({
        config: getDefaultConfiguration(),
        configFilePath: tempConfigFilePath,
        //  this is the 'root' provider, created from the root config fields
        //  (rather than a provider block).
        provider: {
          apiKey: "",
          baseURL: "https://api.openai.com/v1/",
          model: "gpt-3.5-turbo",
          name: "",
          providerId: undefined,
        },
        stdinContent: undefined,
        isFirstRun: true,
        isTTYstdin: true,
        isTTYstdout: false,
        integrations: {
          langfuse: undefined,
        },
      });
      //  Also check that the environment has been hydrated.
      expect(process.env).toStrictEqual(expectedEnrichedEnv);
    });
  });
});
