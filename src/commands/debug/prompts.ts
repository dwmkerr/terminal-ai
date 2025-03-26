import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";

import { select } from "@inquirer/prompts";
import { selectModel } from "../init/select/select-model";

export async function debugPrompts() {
  const choice = await select({
    message: "Prompt",
    choices: [
      {
        name: "Advanced Input: Hint",
        value: "advanced_input_hint",
      },
      {
        name: "Select Model (wo/ default)",
        value: "select_model",
        description: "Select Model (no default / provider)",
      },
      {
        name: "Select Model (w/ default)",
        value: "select_model_default",
        description: "Select Model (with default and provider)",
      },
    ],
  });

  switch (choice) {
    case "advanced_input_hint":
      const result = await advancedInput({
        message: "Enter some text",
        hint: "<Enter> Menu <--- this is a hint",
      });
      console.log(result);
      break;
    case "select_model":
      console.log(await selectModel());
      break;
    case "select_model_default":
      console.log(
        await selectModel("models/gemini-2.0-flash", "gemini_openai"),
      );
      break;
  }
}
