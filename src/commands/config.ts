import { BoxesConfiguration, getConfiguration } from "../lib/configuration";

export async function config(): Promise<BoxesConfiguration> {
  const configuration = getConfiguration();
  return configuration;
}
