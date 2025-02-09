import * as config from "../configuration/configuration";
import { printResponse } from "../theme";

export async function debug(command: string, parameters: string[]) {
  console.log(`debug: command - ${command} with parameters ${parameters}`);
  if (command === "config") {
    console.log("debug: config");
    const defaultConfig = config.getDefaultConfiguration();
    const promptsConfig = config.getConfigurationFromPromptsFolder(
      config.getChatPromptsPath(),
    );
    const fileConfig = config.getConfigurationFromFile(config.getConfigPath());
    const envConfig = config.getConfigurationFromEnv(process.env);
    console.log(`default:`, defaultConfig);
    console.log(`prompts:`, promptsConfig);
    console.log(`file:`, fileConfig);
    console.log(`env:`, envConfig);
    const cfg = await config.getConfiguration();
    console.log(`unified config:`, cfg);
    return;
  } else if (command === "markdown") {
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
    printResponse(markdown, true);
  }
}
