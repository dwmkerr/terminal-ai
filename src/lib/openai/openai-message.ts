import { OpenAIChatRoles } from "./openai-roles";

export type OpenAIMessage = {
  role: OpenAIChatRoles;
  content: string;
};
