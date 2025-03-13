import { providers } from "@dwmkerr/ai-providers-and-models";

export async function debugModels() {
  const providerIds = Object.keys(providers);
  for (const providerId of providerIds) {
    const provider = providers[providerId];
    console.log(`Provider: ${provider.name}`);

    const modelIds = Object.keys(provider.models);
    for (const modelId of modelIds) {
      const model = provider.models[modelId];
      console.log(JSON.stringify(model, null, 2));
    }
  }
}
