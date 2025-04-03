import { ExecutionContext } from "../execution-context/execution-context";
import { ChatContext } from "./ChatContext";

export type ChatPipelineParameters = {
  executionContext: ExecutionContext;
  chatContext: ChatContext;
  inputMessage: string | undefined;
  options: {
    enableContextPrompts: boolean;
    enableOutputPrompts: boolean;
    copy: boolean;
    raw: boolean;
  };
};
