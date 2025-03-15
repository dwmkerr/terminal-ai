import { Langfuse, LangfuseTraceClient } from "langfuse";
import { Configuration } from "../configuration/configuration";

export type LangfuseIntegrationContext = {
  langfuse: Langfuse;
  trace: LangfuseTraceClient;
};

export function integrateLangfuse(
  config: Configuration,
): LangfuseIntegrationContext | undefined {
  //  If we have not provided any langfuse config, we have no integration.
  const lfConfig = config.integrations?.langfuse;
  if (lfConfig === undefined) {
    return undefined;
  }

  //  Create the langfuse object and start a trace. We'll consider a single
  //  execution of the tool a single session (i.e. generations and events and
  //  so on will be grouped into this one session).
  const langfuse = new Langfuse({
    secretKey: lfConfig.secretKey,
    publicKey: lfConfig.publicKey,
    baseUrl: lfConfig.baseUrl,
  });
  const trace = langfuse.trace({
    name: lfConfig.traceName || "terminal-ai",
    sessionId: `session-${Date.now()}`,
    //  e.g:
    //  userId: "user__935d7d1d-8625-4ef4-8651-544613e7bd22",
    //  metadata: { user: "user@langfuse.com" },
    //  tags: ["production"],
  });

  //  Otherwise we can create the langfuse integration. Easy, n'est pas?
  return {
    langfuse: new Langfuse(lfConfig),
    trace: trace,
  };
}
