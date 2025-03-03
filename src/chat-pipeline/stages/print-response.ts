import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { OutputIntent } from "./parse-input";
import { ChatResponse } from "./parse-response";

export async function printResponse(
  params: ChatPipelineParameters,
  response: ChatResponse,
  outputIntent: OutputIntent,
) {
  //  If we are writing raw output, dump it now and we're done.
  if (params.options.raw) {
    console.log(response.rawMarkdownResponse);
  }

  //  If our output intent is code, then we will write the code block only and
  //  format based on whether we have an output TTY.
  if (outputIntent === OutputIntent.Code) {
    if (params.executionContext.isTTYstdout) {
      console.log(response.codeBlocks[0]?.colourFormattedCode);
    } else {
      console.log(response.codeBlocks[0]?.plainTextCode);
    }
    return;
  }

  //  Finally, write the response. If we have a TTY it'll be coloured, otherwise
  //  it'll be formatted as plain text.
  if (params.executionContext.isTTYstdout) {
    console.log(response.colourFormattedResponseWithPrompt);
  } else {
    console.log(response.plainTextFormattedResponse);
  }
}
