import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { writeClipboard } from "../../lib/clipboard";
import { ChatResponse } from "./get-response";

export async function copyResponse(
  params: ChatPipelineParameters,
  response: ChatResponse,
): Promise<boolean> {
  //  If the user does not want to copy, we can immediately return false.
  if (!params.options.copy) {
    return false;
  }

  //  Depending on whether 'raw' is selected or not, copy the raw markdown
  //  or copy the markdown formtatted as plain text.
  //  We show the copy confirmation hint only if we're interactive on stdout.
  if (params.options.raw) {
    await writeClipboard(
      response.rawMarkdownResponse,
      params.executionContext.isTTYstdout,
    );
  } else {
    await writeClipboard(
      response.plainTextFormattedResponse,
      params.executionContext.isTTYstdout,
    );
  }

  //  The copy has happened, we should now terminate.
  return true;
}
