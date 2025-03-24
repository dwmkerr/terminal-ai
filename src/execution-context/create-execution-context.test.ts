import { createExecutionContext } from "./create-execution-context";
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
describe("exuection-context", () => {
  describe("createExecutionContext", () => {
    xtest("it can be created", () => {
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
      const executionContext = createExecutionContext(process);

      expect(executionContext).toMatchObject({
        isTTYstdin: true,
        isTTYstdout: true,
      });
    });
  });
});
