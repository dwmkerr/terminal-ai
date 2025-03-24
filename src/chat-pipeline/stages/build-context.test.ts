import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { buildContext } from "./build-context";

describe("buildContext", () => {
  it("returns the correct context when context prompts are enabled", async () => {
    const params: ChatPipelineParameters = {
      inputMessage: "",
      inputFilePaths: [],
      options: {
        copy: false,
        raw: false,
        enableContextPrompts: true,
        enableOutputPrompts: true,
      },
      executionContext: createTestExecutionContext(),
    };
    params.executionContext.config.prompts.chat.context = [
      "'${ENV_VAR}' is available",
    ];
    const env = { ENV_VAR: "value" };
    const context = await buildContext(params, env);
    expect(context).toHaveLength(1);
    expect(context[0].context).toBe("'value' is available");
  });

  it("returns an empty array when context prompts are disabled", async () => {
    const params: ChatPipelineParameters = {
      inputMessage: "",
      inputFilePaths: [],
      options: {
        copy: false,
        raw: false,
        enableContextPrompts: true,
        enableOutputPrompts: true,
      },
      executionContext: createTestExecutionContext(),
    };
    params.options.enableContextPrompts = false;
    const context = await buildContext(params, {});
    expect(context).toHaveLength(0);
  });

  it("includes stdin content in the context when available", async () => {
    const params: ChatPipelineParameters = {
      inputMessage: "",
      inputFilePaths: [],
      options: {
        copy: false,
        raw: false,
        enableContextPrompts: true,
        enableOutputPrompts: true,
      },
      executionContext: createTestExecutionContext(),
    };
    params.executionContext.stdinContent = "This is stdin content";

    const context = await buildContext(params, {});
    expect(context).toHaveLength(1);
    expect(context[0].context).toContain(
      `<file name="stdin">
This is stdin content
</file>
`,
    );
  });
});
