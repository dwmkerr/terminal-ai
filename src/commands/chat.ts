import OpenAI from "openai";
import theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { Configuration } from "../configuration/configuration";

export async function chat(
  executionContext: ExecutionContext,
  config: Configuration,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string | null> {
  const openai = new OpenAI({
    apiKey: config.openAiApiKey,
  });

  //  Send the input to ChatGPT and read the response.
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
    });

    //  Read the response. If we didn't get one, show an error. Otherwise
    //  print the response and add to the conversation history.
    const response = completion.choices[0]?.message?.content;
    return response;
  } catch (error) {
    theme.printError("Error calling ChatGPT", error);
    return null;
  }
}
