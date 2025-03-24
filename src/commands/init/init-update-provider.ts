import { password, select } from "@inquirer/prompts";
import { ExecutionContext } from "../../execution-context/execution-context";
import { ErrorCode, TerminalAIError } from "../../lib/errors";
import { updateConfigurationFile } from "../../configuration/update-configuration-file";
import { ProviderConfiguration } from "../../configuration/configuration";

export async function initUpdateProvider(executionContext: ExecutionContext) {
  // console.log(
  //   print(`If you need a free API key follow the guide at:`, interactive),
  // );
  // console.log(
  //   print(
  //     `  ${colors.underline(colors.blue("https://github.com/dwmkerr/terminal-ai#api-key\n"))}`,
  //     interactive,
  //   ),
  // );
  // const apiKey = await password({
  //   mask: true,
  //   message: "API Key (Press <Enter> to keep existing):",
  // });
  // if (apiKey !== "") {
  //   //  Note this is not ideal as we are mutating execution state, but needed
  //   //  as we might shortly run a _new_ command such as init.
  //   config.apiKey = apiKey;
  //   saveApiKey(apiKey);
  // }

  // //  Offer advanced options.
  // const model = await selectModel(config.model);
  // if (model !== undefined) {
  //   config.model = model;
  //   console.log(`TODO`);
  //   // saveModel(model);
  // }

  //  Ask for a provider.
  const providerId = await select({
    message: "Your API key provider",
    choices: [
      {
        name: "OpenAI",
        value: "openai",
      },
      {
        name: "Gemini",
        value: "gemini",
      },
      // {
      //   name: "OpenAI Compatible",
      //   value: "openaicompat",
      // },
    ],
  });

  //  Ask for an API key.
  const apiKey = await password({
    mask: true,
    message: "API Key:",
    validate: (key) => (key === "" ? "API key is required" : true),
  });

  //  Create the provider configuration from the settings we've chosen.
  const provider = createProviderConfig(providerId, apiKey);

  //  Update our execution config with the provider, and update the config file.
  executionContext.provider = provider;
  updateConfigurationFile(executionContext.configFilePath, {
    [`provider`]: provider.name,
    [`providers.${provider.name}`]: provider,
  });
}

export function createProviderConfig(
  providerId: string,
  apiKey: string,
): ProviderConfiguration {
  switch (providerId) {
    case "openai":
      return {
        apiKey,
        providerId: "openai",
        name: "openai",
        baseURL: "https://api.openai.com/v1/",
        model: "gpt-3.5-turbo",
      };
    case "gemini":
      return {
        apiKey,
        providerId: "gemini",
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        model: "models/gemini-2.0-flash",
      };
    default:
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        `Cannot create configuration for unknown provider '${providerId}'`,
      );
  }
}
