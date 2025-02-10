//  Defines the potential output intents.
export enum OutputIntent {
  Chat,
  Code,
}

//  A type that describes input, including output intent.
export type InputMessage = {
  message: string;
  outputIntent: OutputIntent;
};

export function parseInput(input: string): InputMessage {
  //  Extract any output intent:
  //  <output_intent>: <message>
  return {
    message: input,
    outputIntent: OutputIntent.Chat,
  };
}
