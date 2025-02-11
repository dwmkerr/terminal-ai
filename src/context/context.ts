import dbg from "debug";
import expandEnvVars from "../lib/expand-env-vars";

const debug = dbg("ai:context");

//  Note that expansion should be performed AFTER the env is hydrated.
export function expandPrompts(
  prompts: string[],
  env: NodeJS.ProcessEnv,
): string[] {
  //  TODO: prompts should be named.
  return prompts.map((prompt) => {
    const expanded = expandEnvVars(prompt, env);
    debug(`hydrated prompt: ${expanded}`);
    return expanded;
  });
}
