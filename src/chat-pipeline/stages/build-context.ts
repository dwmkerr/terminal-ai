import dbg from "debug";
import { expandContext, ExpandedContext } from "../../context/context";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

const debug = dbg("ai:context");

export async function buildContext(
  params: ChatPipelineParameters,
  env: NodeJS.ProcessEnv,
): Promise<ExpandedContext[]> {
  //  Expand each context prompt, as long as expansion is enabled.
  const contextPrompts = params.options.enableContextPrompts
    ? params.config.prompts.chat.context.map((c) => expandContext(c, env))
    : [];

  //  Create our stdin template. Once stdin is stable we'll extract this
  //  into a more sensible location.
  const stdinTemplate = `Refer to 'stdin' when answering.
'stdin' is the content that has been piped to this
CLI tool. It is everything that is between the lines
<file name="stdin"> and </file>. We can treat this as
a file named 'stdin'.
<file name="stdin">
${params.executionContext.stdinContent}
</file>
`;

  //  Expand the stdin content.
  const stdinPrompts: ExpandedContext[] =
    params.executionContext.stdinContent !== undefined
      ? [
          {
            role: "system",
            name: "stdin",
            template: stdinTemplate,
            context: stdinTemplate,
          },
        ]
      : [];
  const context = [...contextPrompts, ...stdinPrompts];
  debug(`expanded context: ${context.map((c) => c.context).join("\n")}`);
  return context;
}
