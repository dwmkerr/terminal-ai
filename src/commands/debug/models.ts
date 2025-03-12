import { providers } from "@dwmkerr/ai-providers-and-models";

export async function debugModels() {
  const openAiProvider = providers[0];
  for (const model of openAiProvider.models) {
    console.log(JSON.stringify(model, null, 2));
  }
}
