import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";

export type ExecuteActionHandler = (
  params: ChatPipelineParameters,
  messages: ChatCompletionMessageParam[],
  response?: ChatResponse,
) => Promise<string | undefined>;

export type ChatAction = {
  //  The internal name, e.g. 'exec'.
  id: string;

  //  The display name, e.g. 'Execute Script', for both initial and then
  //  replies.
  displayNameInitial: string;
  displayNameReply: string;

  //  Is this action available on the first interaction, e.g. before any
  //  conversation has started?
  isInitialInteractionAction: boolean;

  //  Is this action available in Debug Mode only?
  isDebugAction: boolean;

  //  The weight of an action can be used to push it higher up the list of
  //  actions shown to the user.
  weight: number;

  //  The function to actually execute the action.
  execute: ExecuteActionHandler;
};
