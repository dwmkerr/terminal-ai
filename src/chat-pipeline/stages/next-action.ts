import fs from "fs";
import { input, select } from "@inquirer/prompts";
import { editor } from "@inquirer/prompts";
import { confirm } from "@inquirer/prompts";
import { TerminatingError } from "../../lib/errors";
import theme from "../../theme";
import { execCommand } from "../../lib/cli-helpers";
import { writeClipboard } from "../../lib/clipboard";
import { ChatResponse } from "./get-response";

export async function nextAction(response: ChatResponse) {
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
    await writeClipboard(response.plainTextFormattedResponse, true);
  } else if (answer === "save") {
    const inputPrompt = theme.inputPrompt("Save As");
    const path = await input({ message: inputPrompt });
    try {
      fs.writeFileSync(path, response.plainTextFormattedResponse, "utf8");
      console.log(`✅ Response saved to ${path}!`);
    } catch (err) {
      throw new TerminatingError(
        "Error saving response - you might be overwriting a file or saving in a folder that doesn't exist?",
      );
    }
  } else if (answer === "exec") {
    const code = await editor({
      message: "Verify your script - AI can make mistakes!",
      default: response.codeBlocks[0]?.plainTextCode,
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
