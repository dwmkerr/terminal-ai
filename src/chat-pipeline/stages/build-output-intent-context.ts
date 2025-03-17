import dbg from "debug";
import { expandContext, ExpandedContext } from "../../context/context";
import { ChatPipelineParameters } from "../ChatPipelineParameters";

import { OutputIntent } from "./parse-input";

const debug = dbg("ai:chat-pipeline:build-output-intent-context");

export async function buildOutputIntentContext(
  params: ChatPipelineParameters,
  env: NodeJS.ProcessEnv,
  outputIntent: OutputIntent,
): Promise<ExpandedContext[]> {
  //  If output intent context prompts have been disabled, we have no prompts to create.
  if (!params.options.enableOutputPrompts) {
    return [];
  }

  //  Any output intent that is not code we do not handle.
  if (outputIntent !== OutputIntent.Code) {
    return [];
  }

  //  Expand each context prompt.
  debug("'code' output intent detected, creating prompts...");
  return params.executionContext.config.prompts.code.output.map((c) =>
    expandContext(c, env),
  );
}
