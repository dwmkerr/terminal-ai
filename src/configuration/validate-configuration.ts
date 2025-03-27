import { ErrorCode, TerminalAIError } from "../lib/errors";
import { Configuration } from "./configuration";

export function validateConfiguration(config: Configuration) {
  //  If we have a provider name, the provider must exist.
  if (config.provider && !config.providers[config.provider]) {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      `provider '${config.provider}' not found in 'providers' block - check ~/.ai/config.yaml or run 'ai init'`,
    );
  }
}
