import { expandContext, ExpandedContext } from "../../context/context";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

export async function buildContext(
  params: ChatPipelineParameters,
  env: NodeJS.ProcessEnv,
): Promise<ExpandedContext[]> {
  //  If context prompts have been disabled, we have no prompts to create.
  if (!params.options.enableContextPrompts) {
    return [];
  }

  //  Expand each context prompt.
  return params.config.prompts.chat.context.map((c) => expandContext(c, env));
}
