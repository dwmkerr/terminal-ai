import { search } from "@inquirer/prompts";
import { OpenAIChatModels, toChatModel } from "../../lib/openai/openai-models";
import { ChatModel } from "openai/resources/index.mjs";

export async function selectModel(
  defaultModel: ChatModel,
): Promise<ChatModel | undefined> {
  const answer = (await search({
    message: `Select model [leave blank to use ${defaultModel}]:`,
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

  return answer === "" ? defaultModel : toChatModel(answer);
}
