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
  let tempTestFolder: string;
  let tempConfigFolder: string;
  let tempConfigFilePath: string;
  let tempConfigPromptsFolder: string;
  let expectedEnrichedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempTestFolder = fs.mkdtempSync(`ai-tests`);
    tempConfigFolder = path.join(
      tempTestFolder,
      ConfigurationPaths.ConfigFolder,
    );
    tempConfigFilePath = path.join(
      tempConfigFolder,
      ConfigurationPaths.ConfigFile,
    );
    tempConfigPromptsFolder = path.join(
      tempConfigFolder,
      ConfigurationPaths.PromptsFolder,
      ConfigurationPaths.ConfigFile,
    );
    fs.mkdirSync(tempConfigPromptsFolder, { recursive: true });
    expectedEnrichedEnv = {
      OS_PLATFORM: os.platform(),
      TTY_WIDTH: `${process.stdout.columns || 80}`,
      TTY_HEIGHT: `${process.stdout.rows || 24}`,
    };
  });

  afterEach(() => {
    fs.rmdirSync(tempTestFolder, { recursive: true });
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
        //  (rather than a provider block), as per docs assumed to be 'openai'
        provider: {
          apiKey: "",
          baseURL: "https://api.openai.com/v1/",
          model: "gpt-3.5-turbo",
          name: "",
          type: "openai",
        },
        stdinContent: undefined,
        isFirstRun: true,
        isTTYstdin: true,
        isTTYstdout: false,
        integrations: {
          langfuse: undefined,
        },
      });

      //  Also check for the enriched env.
      expect(process.env).toStrictEqual(expectedEnrichedEnv);
    });
  });
});
