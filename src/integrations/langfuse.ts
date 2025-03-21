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

  //  Create the langfuse object and start a trace.
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

  return {
    langfuse,
    trace: trace,
  };
}
