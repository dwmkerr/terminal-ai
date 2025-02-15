import dbg from "debug";
import fs from "fs";
import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { editor } from "@inquirer/prompts";
import { confirm } from "@inquirer/prompts";

import { chat as chatCommand } from "../commands/chat";
import theme from "../theme";
import { ExecutionContext } from "../lib/execution-context";
import { TerminatingError, TerminatingWarning } from "../lib/errors";
import { Configuration } from "../configuration/configuration";
import { ensureApiKey } from "./stages/ensure-api-key";
import { plainTextCode } from "../lib/markdown";
import { OutputIntent, parseInput } from "../lib/input";
import { writeClipboard } from "../lib/clipboard";
import { execCommand } from "../lib/cli-helpers";
import { expandContext } from "../context/context";
import { OpenAIChatRoles } from "../lib/openai/openai-roles";

const debug = dbg("ai:chat-pipeline");

export type ChatPipelineParameters = {
  executionContext: ExecutionContext;
  config: Configuration;
  inputMessage: string | undefined;
  inputFilePaths: string[];
  options: {
    enableContextPrompts: boolean;
    enableOutputPrompts: boolean;
    copy: boolean;
  };
};

export async function executeChatPipeline(params: ChatPipelineParameters) {
  //  Stage 1: Ensure we have the required configuration.
  const config = await ensureApiKey(params.executionContext, params.config);
  //  Stage 2: Upload input files.
  //  console.log(`files`, files);

  //  Stage 3: Determine our initial input.

  //  Our chat input will be the initial input if set, otherwise we'll have
  //  to prompt for it. We can also set the chat input params to have a nice
  //  color.
  const chatInputMessgae = theme.inputPrompt("chat");
  let chatInput = params.inputMessage || "";
  if (chatInput === "") {
    //  We need to ask for input. If we're non interactive, we must fail.
    if (!params.executionContext.isInteractive) {
      throw new TerminatingWarning(
        "The 'input' argument is required, try 'ai -- \"good morning\"",
      );
    }
    chatInput = await input({ message: chatInputMessgae });
  }

  //  Create a converstion history that we will maintain as we interact.
  //  Add any chat prompts.
  const conversationHistory: { role: OpenAIChatRoles; content: string }[] = [];

  //  If context prompts are enabled, add them now.
  if (params.options.enableContextPrompts) {
    const prompts = config.prompts.chat.context
      .map((c) => expandContext(c, process.env))
      .map((c) => ({
        role: c.role,
        content: c.value,
      }));
    conversationHistory.push(...prompts);
  }

  //  Repeatedly interact with ChatGPT as long as we have chat input.
  while (chatInput !== "") {
    //  Deconstruct our chat input into a message and intent.
    const inputAndIntent = parseInput(chatInput);
    debug(`intent: `, inputAndIntent);

    //  If we're using the 'code' output intent, expand and add the prompts.
    if (inputAndIntent.outputIntent === OutputIntent.Code) {
      if (params.options.enableOutputPrompts) {
        debug("'code' output intent detected, adding prompt...");
        const prompts = config.prompts.code.output
          .map((c) => expandContext(c, process.env))
          .map((c) => ({
            role: c.role,
            content: c.value,
          }));
        conversationHistory.push(...prompts);
      }
    }

    conversationHistory.push({ role: "user", content: inputAndIntent.message });
    const response = await chatCommand(
      params.executionContext,
      config,
      conversationHistory,
    );

    //  If our intent is code and we're writing to a file, make it plain text
    //  code.
    const responseText = theme.printResponse(
      response,
      params.executionContext.isInteractive,
    );
    if (params.options.copy) {
      await writeClipboard(plainTextCode(response), true);
      return;
    } else if (
      inputAndIntent.outputIntent === OutputIntent.Code &&
      params.executionContext.isInteractive === false
    ) {
      console.log(plainTextCode(responseText));
    } else {
      console.log(responseText);
    }
    conversationHistory.push({
      role: "assistant",
      content: response,
    });

    //  Clear the next chat input. If we're interactive, we can continue the
    //  conversation
    chatInput = "";
    if (params.executionContext.isInteractive) {
      while (chatInput === "") {
        theme.printHint("(Reply below or press Enter for more options...)");
        chatInput = await input({
          message: chatInputMessgae,
        });

        //  If the user just pressed 'enter' - no reply - we show options.
        if (chatInput === "") {
          process.stdout.write("\u001b[1A\u001b[K"); // Delete previous line and move cursor up
          process.stdout.write("\u001b[1A\u001b[K"); // Delete previous line and move cursor up
          await nextOption(response || "");
        }
      }
    }
  }
}

export async function nextOption(response: string) {
  //  Loop until we know we've got an option we can continue with.
  const answer = await select({
    message: theme.inputPrompt("What next?"),
    default: "reply",
    choices: [
      {
        name: "Reply",
        value: "reply",
      },
      {
        name: "Copy Response",
        value: "copy",
      },
      {
        name: "Save Response",
        value: "save",
      },
      {
        name: "Execute Response",
        value: "exec",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  });

  //  Delete the previous line, i.e. the selection line, so that the output
  //  stays clean.
  process.stdout.write("\u001b[1A" + "\u001b[2K");

  //  If the answer is copy, copy the response to the clipboard.
  if (answer === "reply") {
  } else if (answer === "copy") {
    await writeClipboard(plainTextCode(response), true);
  } else if (answer === "save") {
    const inputPrompt = theme.inputPrompt("Save As");
    const path = await input({ message: inputPrompt });
    try {
      fs.writeFileSync(path, plainTextCode(response), "utf8");
      console.log(`✅ Response saved to ${path}!`);
    } catch (err) {
      throw new TerminatingError(
        "Error saving response - you might be overwriting a file or saving in a folder that doesn't exist?",
      );
    }
  } else if (answer === "exec") {
    const code = await editor({
      message: "Verify your script - AI can make mistakes!",
      default: plainTextCode(response),
      postfix: "sh",
    });
    const validate = await confirm({
      message: "Are you sure you want to execute this code?",
      default: false,
    });
    if (validate) {
      await execCommand(code, true);
    }
  } else if (answer === "quit") {
    process.exit(0);
  }
}
