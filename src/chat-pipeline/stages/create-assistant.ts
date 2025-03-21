import OpenAI from "openai";
import { Configuration } from "../../configuration/configuration";
import { Assistant } from "openai/resources/beta/assistants.mjs";

export async function createAssistant(
  openai: OpenAI,
  config: Configuration,
): Promise<Assistant> {
  const instructions = [
    "You are called Terminal AI. You are an assistant help users interface with AI technology directly from a terminal interface.",
    config.prompts.chat.context,
  ];

  const assistant = await openai.beta.assistants.create({
    name: "Termianl AI",
    instructions: instructions.join("\n"),
    model: config.model,
    //  TODO: decide what tools we want.
    tools: [{ type: "code_interpreter" }],
    // file_ids: [file.id],
  });

  return assistant;
}
