import { marked } from "marked";

import { formatMarkdown, plainTextCode } from "../../lib/markdown";
import { printResponse } from "../../print/print-response";

export type CodeBlock = {
  language: string;
  rawMarkdownCode: string;
  colourFormattedCode: string;
  plainTextCode: string;
};

export type ChatResponse = {
  rawMarkdownResponse: string;
  colourFormattedResponseWithPrompt: string;
  plainTextFormattedResponse: string;
  codeBlocks: CodeBlock[];
};

export function parseResponse(
  prompt: string,
  rawMarkdownResponse: string,
): ChatResponse {
  //  Take the raw response, which is markdown, then create a coloured version
  //  of it suitable for printing to a TTY, as well as a plain text version
  //  of it, suitable for writng to a file.
  //  Note that we're creating a coloured repsonse here no matter what...
  const colourFormattedResponseWithPrompt = printResponse(
    prompt,
    rawMarkdownResponse,
    true,
  );
  const plainTextResponse = plainTextCode(rawMarkdownResponse);

  //  Now we'll explicitly extract the code blocks.
  const tokens = marked.lexer(rawMarkdownResponse);
  const markdownCodeBlocks = tokens.filter((token) => token.type === "code");
  const codeBlocks: CodeBlock[] = markdownCodeBlocks.map((mdcb) => {
    return {
      language: (mdcb as Record<string, string>)["lang"],
      rawMarkdownCode: mdcb.raw,
      colourFormattedCode: formatMarkdown(mdcb.raw),
      plainTextCode: (mdcb as Record<string, string>)["text"],
    };
  });

  return {
    rawMarkdownResponse,
    colourFormattedResponseWithPrompt,
    plainTextFormattedResponse: plainTextResponse,
    codeBlocks: codeBlocks,
  };
}
