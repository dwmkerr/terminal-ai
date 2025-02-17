import dbg from "debug";
import expandEnvVars from "../lib/expand-env-vars";
import { OpenAIChatRoles } from "../lib/openai/openai-roles";

const debug = dbg("ai:context");

export type ExpandedContext = {
  role: OpenAIChatRoles;
  name: string;
  template: string;
  context: string;
};

//  Expands contextual data using environment variables.
//  Note that name/role is still hard-coded but can be added later on.
export function expandContext(
  contextTemplate: string,
  env: NodeJS.ProcessEnv,
): ExpandedContext {
  const context = expandEnvVars(contextTemplate, env);
  debug(`expanded context: ${context}`);
  return {
    role: "user",
    name: "<Unnamed Context>",
    template: contextTemplate,
    context: context,
  };
}
