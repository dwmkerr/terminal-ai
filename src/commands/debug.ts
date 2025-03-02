import OpenAI from "openai";
import { Configuration } from "../configuration/configuration";
import { ExecutionContext } from "../lib/execution-context";
import { printResponse } from "../theme";

export async function debug(
  executionContext: ExecutionContext,
  config: Configuration,
  command: string,
  parameters: string[],
) {
  console.log(`debug: command - ${command} with parameters ${parameters}`);
  if (command === "markdown") {
    const markdown = `# Markdown Formatting

**Bold Text**

*Italic Text*

***Bold and Italic Text***

## List of Items:
1. Item 1
2. Item 2
3. Item 3

### Code Block Example:
\`\`\`bash
echo "Hello, World!"
\`\`\`

> Blockquote Example

[Link to Google](https://www.google.com)
\`\`\`
    `;
    console.log(printResponse("chatgpt", markdown, true));
  } else if (command === "models") {
    const openai = new OpenAI({
      apiKey: config.openAiApiKey,
    });
    //  Call any API to check our key.
    const models = await openai.models.list();
    console.log(models);
  }
}
