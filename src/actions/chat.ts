import * as readline from "readline";
import { chat as chatCommand } from "../commands/chat";

export async function chat() {
  // This will run when no command is specified
  const rl = readline.promises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const input = await rl.question("chat: ");
  await chatCommand(input);
}
