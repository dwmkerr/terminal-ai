import { GeminiModels, OpenAIChatModels } from "../lib/openai/openai-models";
import { ProviderType } from "./provider-type";

export function getPredefinedModels(providerType: ProviderType) {
  switch (providerType) {
    case "openai": {
      return OpenAIChatModels;
    }
    case "gemini_openai": {
      return GeminiModels;
    }
    case "openai_compatible": {
      return [];
    }
    default: {
      return [];
    }
  }
}
