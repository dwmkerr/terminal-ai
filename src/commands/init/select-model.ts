import { search } from "@inquirer/prompts";
import { providers } from "@dwmkerr/ai-providers-and-models";

import { OpenAIChatModels } from "../../lib/openai/openai-models";

type Choice<Value> = {
  value: Value;
  name: string;
  description: string;
  short?: string;
  disabled?: boolean | string;
};

export async function selectModel(defaultModel: string): Promise<string> {
  //  We have a set of chat models defined in the app:
  const predefinedModels = OpenAIChatModels;

  //  We also have a subset of models from the 'ai providers and models' repo.
  const openAIprovider = providers.find((p) => p.id === "openai");
  const validatedOpenAImodels = openAIprovider?.models || [];

  //  Now let's join these together to get a set of choices - each of the
  //  predefined models as well as an indicator of whether it is validated.
  //  We include a 'default' answer which is the empty string - this'll just
  //  keep what the user has already selected.
  const empty: Choice<string> = {
    name: `(Keep existing) ${defaultModel}`,
    value: "",
    description: `(Keep existing) ${defaultModel}`,
    disabled: false,
  };
  const choices: Choice<string>[] = [
    empty,
    ...predefinedModels.map((modelId: string): Choice<string> => {
      const validatedModel = validatedOpenAImodels.find(
        (v) => v.id === modelId,
      );
      //  If we don't have a validated model, we show what we can...
      if (!validatedModel) {
        return {
          value: modelId,
          name: `${modelId} *`,
          description: "* not fully validated",
          disabled: false,
        };
      } else {
        return {
          value: modelId,
          name: `${modelId}`,
          description: validatedModel.description_short,
          disabled: false,
        };
      }
    }),
  ];

  const answer = (await search({
    message: `Select model:`,
    source: async (input): Promise<Choice<string>[]> => {
      //  Search models.
      const search = (models: Choice<string>[], val: string) =>
        models.filter(
          (m) => m.value.toLowerCase().indexOf(val.toLowerCase()) !== -1,
        );

      if (!input) {
        return choices;
      } else {
        return search(choices, input);
      }
    },
  })) as string;

  return answer === "" ? defaultModel : answer;
}
