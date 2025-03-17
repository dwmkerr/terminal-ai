import { Configuration } from "../configuration/configuration";
import { LangfuseIntegrationContext } from "../integrations/langfuse";

export type Integrations = {
  langfuse?: LangfuseIntegrationContext;
};

/**
 * ExecutionContext: represents the state of the running program. This includes
 * things like the configuration that was provided, but also things like the
 * intput and output stream types. This object is passed down along almost every
 * flow in the application.
 */
export type ExecutionContext = {
  //  The configuration.
  config: Configuration;

  //  More explicity, do we believe we have a TTY?
  isTTYstdin: boolean;
  isTTYstdout: boolean;

  //  If we have piped input to stdin, it'll be here.
  stdinContent: string | undefined;

  //  Integrations which we might have enabled.
  integrations?: Integrations;
};
