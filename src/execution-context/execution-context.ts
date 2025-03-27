import {
  Configuration,
  ProviderConfiguration,
} from "../configuration/configuration";
import { LangfuseIntegrationContext } from "../integrations/langfuse";

/**
 * Integrations.
 */
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
  configFilePath: string;
  config: Configuration;

  //  Our current provider.
  provider: ProviderConfiguration;

  //  Are we on a first run, e.g. init-ing key etc?
  isFirstRun: boolean;

  //  More explicity, do we believe we have a TTY?
  isTTYstdin: boolean;
  isTTYstdout: boolean;

  //  If we have piped input to stdin, it'll be here.
  stdinContent: string | undefined;

  //  Integrations which we might have enabled.
  integrations?: Integrations;
};

/**
 * StdStreamLike - essentially 'process.stdin/stdout' object fields we need to
 * create an execution context. Extracted into an interface to make unit
 * testing easier.
 */
export interface StdStreamLike {
  isTTY: boolean;
  on: (
    event: string,
    listener: (data: Buffer) => void,
  ) => StdStreamLike | undefined;
}

/**
 * ProcessLike - essentially the 'process' object fields we need to create an
 * execution context. Extracted into an interface to make unit testing easier.
 */
export interface ProcessLike {
  stdin: StdStreamLike;
  stdout: StdStreamLike;
  env: NodeJS.ProcessEnv;
}
