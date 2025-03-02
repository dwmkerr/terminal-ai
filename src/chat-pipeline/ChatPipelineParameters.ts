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

    //  If set to true, then after stdin is read we will actually re-attach
    //  stdin to /dev/stdin and allow more input.
    reopenStdin: boolean;
  };
};
