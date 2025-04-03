import dbg from "debug";
import { InputMessage } from "./parse-input";
import { ChatContext } from "../ChatContext";
import { loadStdinInput } from "../../input/file-input/load-stdin-input";
import { StdStreamLike } from "../../execution-context/execution-context";
import {
  delimitFileInputForChat,
  loadFileInput,
} from "../../input/file-input/delimit-file-input";
const debug = dbg("ai:chat-pipeline:append-input-files");

export async function loadAndAppendInputFiles(
  stdin: StdStreamLike,
  chatContext: ChatContext,
  inputMessage: InputMessage,
): Promise<InputMessage> {
  //  Go through the file path inbox, load any files. We'll always try to load
  //  from stdin as well if it has data.
  const stdinFile = await loadStdinInput(stdin);
  const paths = chatContext.filePathsOutbox;
  const files = await Promise.all(
    paths.map((p) => (p === "-" ? loadStdinInput(stdin) : loadFileInput(p))),
  );
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
    message: inputMessage + "\n" + filesMessages,
  };
  debug(`new input: ${inputMessage.message}`);

  //  Clear the inbox and we're done.
  chatContext.filePathsOutbox.forEach((f) => chatContext.filePathsSent.push(f));
  chatContext.filePathsOutbox = [];
  inputFiles.forEach((f) => chatContext.filesSent.push(f));
  return message;
}
