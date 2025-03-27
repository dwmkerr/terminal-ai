import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants.mjs";
import { ExecutionContext } from "../../execution-context/execution-context";

export async function createAssistant(
  openai: OpenAI,
  executionContext: ExecutionContext,
): Promise<Assistant> {
  const instructions = [
    "You are called Terminal AI. You are an assistant help users interface with AI technology directly from a terminal interface.",
    executionContext.config.prompts.chat.context,
  ];

  const assistant = await openai.beta.assistants.create({
    name: "Termianl AI",
    instructions: instructions.join("\n"),
    model: executionContext.provider.model,
  });

  return assistant;
}
