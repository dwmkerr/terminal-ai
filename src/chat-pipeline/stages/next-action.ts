import { select } from "@inquirer/prompts";
import theme from "../../theme";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { OpenAIMessage } from "../../lib/openai/openai-message";
import { ChatResponse } from "./parse-response";
import { ChatActions } from "../../chat-actions";
import { TerminatingError } from "../../lib/errors";

export async function nextAction(
  params: ChatPipelineParameters,
  initialInputActions: boolean,
  messages: OpenAIMessage[],
  response?: ChatResponse,
): Promise<void> {
  //  Create the input choices for the actions. This will likely later be a
  //  search input with some defaults shown.
  //  Only show debug actions if we're in debug mode.
  //  Only show initial actions if we're in the initial prompt.
  const choices = ChatActions.filter((ca) =>
    ca.isDebugAction ? params.config.debug.enable : true,
  )
    .filter((ca) =>
      initialInputActions ? ca.isInitialInteractionAction : true,
    )
    .map((ca) => ({
      name: ca.displayName,
      value: ca.id,
    }));

  //  Loop until we know we've got an option we can continue with.
  const answer = await select({
    message: theme.inputPrompt("What next?"),
    default: "reply",
    choices,
  });

  //  Delete the previous line, i.e. the selection line, so that the output
  //  stays clean.
  process.stdout.write("\u001b[1A" + "\u001b[2K");

  //  Find the action that was selected.
  const action = ChatActions.find((ca) => ca.id === answer);
  if (!action) {
    throw new TerminatingError(
      `Unable to find definition for action '${answer}'`,
    );
  }

  //  Execute the action.
  await action.execute(params, messages, response);
}
