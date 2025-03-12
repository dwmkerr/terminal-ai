import { search } from "@inquirer/prompts";
import { OpenAIChatModels } from "../../lib/openai/openai-models";

export async function selectModel(defaultModel: string): Promise<string> {
  const answer = (await search({
    message: `Select model [leave blank for existing ${defaultModel}]:`,
    source: async (input): Promise<string[]> => {
      //  Search models.
      const search = (models: string[], val: string) =>
        models
          .map((m) => m.toLowerCase())
          .filter((m) => m.indexOf(val.toLowerCase()) !== -1);

      if (!input) {
        return OpenAIChatModels;
      } else {
        return search(OpenAIChatModels, input);
      }
    },
  })) as string;

  return answer || defaultModel;
}
