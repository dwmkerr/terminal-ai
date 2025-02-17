import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";

export type ChatPipelineParameters = {
  executionContext: ExecutionContext;
  config: Configuration;
  inputMessage: string | undefined;
  inputFilePaths: string[];
  options: {
    enableContextPrompts: boolean;
    enableOutputPrompts: boolean;
    copy: boolean;
    raw: boolean;
  };
};
