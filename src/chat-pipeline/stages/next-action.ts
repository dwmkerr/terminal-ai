import { select } from "@inquirer/prompts";
import theme, { deleteLinesAboveCursor } from "../../theme";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { OpenAIMessage } from "../../lib/openai/openai-message";
import { ChatResponse } from "./parse-response";
import { ChatActions } from "../../chat-actions";
import { TerminatingError } from "../../lib/errors";

//  If a truthy string is returned, then it should be considered the next part
//  of the input to a chat.
export async function nextAction(
  params: ChatPipelineParameters,
  initialInputActions: boolean,
  messages: OpenAIMessage[],
  response?: ChatResponse,
): Promise<string | undefined> {
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
      name: initialInputActions ? ca.displayNameInitial : ca.displayNameReply,
      value: ca.id,
    }));

  //  Loop until we know we've got an option we can continue with.
  //  If we receive a 'ctrl+c' then rather than quitting we'll just close the
  //  action menu.
  let answer = "";
  try {
    //  Delete the line above us - this would be the 'chat' input prompt. We
    //  write our own, which looks just like it, but takes a menu of options.
    deleteLinesAboveCursor(1);

    answer = await select({
      message: theme.inputPrompt("chat"),
      default: "reply",
      choices,
    });
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof Error && err.name === "ExitPromptError") {
      // return undefined;
      return "";
    } else {
      throw err;
    }
  }

  //  Delete the previous line so that the output still lines up once we've
  //  selected an option.
  deleteLinesAboveCursor(1);

  //  Find the action that was selected.
  const action = ChatActions.find((ca) => ca.id === answer);
  if (!action) {
    throw new TerminatingError(
      `Unable to find definition for action '${answer}'`,
    );
  }

  //  Execute the action.
  return await action.execute(params, messages, response);
}
