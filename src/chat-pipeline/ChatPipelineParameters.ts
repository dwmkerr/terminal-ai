import { ExecutionContext } from "../lib/execution-context";

export type ChatPipelineParameters = {
  executionContext: ExecutionContext;
  inputMessage: string | undefined;
  inputFilePaths: string[];
  options: {
    enableContextPrompts: boolean;
    enableOutputPrompts: boolean;
    copy: boolean;
    raw: boolean;
  };
};
