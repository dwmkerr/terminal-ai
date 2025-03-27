import { ProviderConfiguration } from "../configuration/configuration";
import { ErrorCode, TerminalAIError } from "../lib/errors";
import { ProviderType } from "./provider-type";

export function createProviderConfig(
  providerType: ProviderType,
  apiKey: string,
): ProviderConfiguration {
  switch (providerType) {
    case "openai":
      return {
        apiKey,
        type: "openai",
        name: "openai",
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
      };
    case "gemini_openai":
      return {
        apiKey,
        type: "gemini_openai",
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        model: "models/gemini-2.0-flash",
      };
    case "openai_compatible":
      return {
        apiKey,
        type: "openai_compatible",
        name: "openai_compatible",
        baseURL: "",
        model: "",
      };
    default:
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        `Cannot create configuration for unknown provider type '${providerType}'`,
      );
  }
}
