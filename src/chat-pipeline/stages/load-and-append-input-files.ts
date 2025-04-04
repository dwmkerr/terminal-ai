import dbg from "debug";
import { InputMessage } from "./parse-input";
import { ChatContext } from "../ChatContext";
import { loadStdinInput } from "../../input/file-input/load-stdin-input";
import { StdStreamLike } from "../../execution-context/execution-context";
import {
  delimitFileInputForChat,
  loadFileInput,
} from "../../input/file-input/delimit-file-input";
import { printHint } from "../../theme";

const debug = dbg("ai:chat:loadAndAppendInputFiles");

export async function loadAndAppendInputFiles(
  stdin: StdStreamLike,
  chatContext: ChatContext,
  inputMessage: InputMessage,
  interactive: boolean,
): Promise<InputMessage> {
  //  Go through the file path inbox, load any files. We'll always try to load
  //  from stdin as well if it has data.
  const stdinFile = await loadStdinInput(stdin);
  const paths = chatContext.filePathsOutbox;
  const files = await Promise.all(paths.map(loadFileInput));
  const inputFiles = [...files, stdinFile].filter((f) => f !== undefined);

  //  No files means nothing to do.
  if (inputFiles.length === 0) {
    return inputMessage;
  }

  //  Construct a message with each file delimited.
  const filesMessages = inputFiles.map(delimitFileInputForChat).join("\n");

  //  Create our new chat input - with the files added.
  const message = {
    ...inputMessage,
    message: filesMessages + "\n" + inputMessage.message,
  };

  //  If we're interactive, we can include a 'sending' message.
  if (interactive) {
    inputFiles.map((f) =>
      console.log(printHint(`(uploading: ${f.path}...)`, interactive)),
    );
  }

  //  Clear the inbox, update the outbox, and we're done.
  chatContext.filePathsSent = chatContext.filePathsSent.concat(paths);
  chatContext.filesSent = chatContext.filesSent.concat(inputFiles);
  chatContext.filePathsOutbox = [];
  debug(message.message);
  return message;
}
