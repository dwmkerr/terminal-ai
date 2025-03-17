import { ExecutionContext } from "../lib/execution-context";
import { printResponse } from "../theme";
import { debugInput } from "./debug/input";
import { debugModels } from "./debug/models";

export async function debug(
  executionContext: ExecutionContext,
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
    await debugModels();
  } else if (command === "input") {
    await debugInput(executionContext);
  }
}
