import OpenAI from "openai";
import colors from "colors/safe";
import { Configuration } from "../configuration/configuration";
import { ExecutionContext } from "../lib/execution-context";
import { printResponse } from "../theme";
import { debugInput } from "./debug/input";
import { Model } from "openai/resources/models.mjs";

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
    //  Get all of the models.
    let page = await openai.models.list();
    let apiModels: Model[] = [];
    while (page) {
      apiModels = [...apiModels, ...page.data.map((m) => m)];
      if (!page.hasNextPage()) {
        break;
      }
      page = await page.getNextPage();
    }
    for (const model of apiModels) {
      try {
        const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          [];
        conversationHistory.push({
          role: "user",
          content: "what model and version are you",
        });
        /*const completion = */ await openai.chat.completions.create({
          messages: conversationHistory,
          model: model.id,
        });
        /*const response = completion.choices[0]?.message?.content; */
        console.log(`${model.id} (${model.owned_by}) - ${colors.green("ok")}`);
      } catch (err) {
        console.log(`${model.id} (${model.owned_by}) - ${colors.red("err")}`);
      }
    }
  } else if (command === "input") {
    await debugInput(executionContext, config);
  }
}
