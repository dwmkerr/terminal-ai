import { search, Separator } from "@inquirer/prompts";
import { providers } from "@dwmkerr/ai-providers-and-models";

import { OpenAIChatModels } from "../../lib/openai/openai-models";

type Choice<Value> = {
  value: Value;
  name: string;
  description: string;
  short?: string;
  disabled?: boolean | string;
};

type ModelChoice = Choice<string>;
type ModelChoices = (ModelChoice | Separator)[];

export async function selectModel(defaultModel: string): Promise<string> {
  //  We have a set of chat models defined in the app:
  const predefinedModels = OpenAIChatModels;

  //  We also have a subset of models from the 'ai providers and models' repo.
  const openAIprovider = providers["openai"];
  const validatedOpenAImodels = openAIprovider?.models || {};

  //  Helper function to determine whether a given model id represents a
  //  validated model from our external repo.
  const isValidatedModel = (id: string) => !!validatedOpenAImodels[id];
  const validatedModelChoices = predefinedModels
    .filter(isValidatedModel)
    .map((m) => {
      const model = validatedOpenAImodels[m];
      return {
        value: model.id,
        name: `${model.name} (${model.id})`,
        description: model.description_short,
        disabled: false,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const unvalidatedModelChoices = predefinedModels
    .filter((m) => !isValidatedModel(m))
    .map((modelId) => {
      return {
        value: modelId,
        name: `${modelId} *`,
        description: `${modelId} - not fully tested`,
        disabled: false,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  //  Now let's join these together to get a set of choices - each of the
  //  predefined models as well as an indicator of whether it is validated.
  //  We include a 'default' answer which is the empty string - this'll just
  //  keep what the user has already selected.
  const empty: ModelChoice = {
    name: `(Keep existing) ${defaultModel}`,
    value: "",
    description: "",
    disabled: false,
  };
  const choices: ModelChoices = [
    empty,
    new Separator(" ────────────── "),
    ...validatedModelChoices,
    new Separator(" ────────────── untested "),
    ...unvalidatedModelChoices,
  ];

  const answer = (await search({
    message: `Select model:`,
    source: async (input): Promise<ModelChoices> => {
      //  Search models.
      const search = (models: ModelChoices, val: string) =>
        models.filter((m) => {
          const value = (m as ModelChoice)?.value;
          if (value) {
            return value.toLowerCase().indexOf(val.toLowerCase()) !== -1;
          } else {
            return false;
          }
        });

      if (!input) {
        return choices;
      } else {
        return search(choices, input);
      }
    },
  })) as string;

  return answer === "" ? defaultModel : answer;
}
