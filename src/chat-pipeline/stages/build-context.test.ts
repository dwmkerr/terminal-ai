// __tests__/buildContext.test.js

import { getDefaultConfiguration } from "../../configuration/configuration";
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
      config: getDefaultConfiguration(),
      executionContext: {
        stdinContent: undefined,
        isTTYstdin: true,
        isTTYstdout: true,
        firstTime: false,
      },
    };
    params.config.prompts.chat.context = ["'${ENV_VAR}' is available"];
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
      config: getDefaultConfiguration(),
      executionContext: {
        stdinContent: undefined,
        isTTYstdin: true,
        isTTYstdout: true,
        firstTime: false,
      },
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
      config: getDefaultConfiguration(),
      executionContext: {
        stdinContent: undefined,
        isTTYstdin: true,
        isTTYstdout: true,
        firstTime: false,
      },
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
