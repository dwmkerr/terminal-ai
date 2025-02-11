import dbg from "debug";
const debug = dbg("ai:input");

//  Defines the potential output intents.
export enum OutputIntent {
  Unknown,
  Chat,
  Code,
}

//  A type that describes input, including output intent.
export type InputMessage = {
  message: string;
  outputIntent: OutputIntent;
};

export function parseInput(input: string): InputMessage {
  //  Extract any intent which might be present.
  const regex = /^(\S+):\s*([\s\S]*)/;
  const match = input.match(regex);

  let outputIntent = OutputIntent.Unknown;
  let message = input;

  if (match) {
    const [, intent, extractedMessage] = match;
    message = extractedMessage.trim();

    // Convert intent to a recognized OutputIntent
    if (intent.toLowerCase() === "chat") {
      outputIntent = OutputIntent.Chat;
    } else if (intent.toLowerCase() === "code") {
      outputIntent = OutputIntent.Code;
    } else {
      debug(
        `warning: output intent '${intent}' not recognised, using 'Unknown'`,
      );
    }
  }

  return { message, outputIntent };
}
