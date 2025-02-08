import * as config from "../configuration/configuration";

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
  }
  return {};
}
