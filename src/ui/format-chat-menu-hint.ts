import colors from "colors/safe";
import { ProviderConfiguration } from "../configuration/configuration";

function providerAndModel(provider: ProviderConfiguration): {
  providerPart: string;
  modelPart: string;
} {
  const providerPart = provider.name === "" ? "" : provider.name + ":";
  const modelPart = provider.model;
  return { providerPart, modelPart };
}

export function formatChatMenuHint(
  terminalWidth: number,
  provider?: ProviderConfiguration,
) {
  //  The menu hint.
  const menuHint = "<Enter> Menu";

  //  If we have no provider, just show the menu.
  if (!provider) {
    return colors.grey(menuHint);
  }

  //  Get the provider details. Work out the maximum amount of space this can
  //  take up, trim the details if needed.
  const { providerPart, modelPart } = providerAndModel(provider);
  const providerDetails = providerPart + modelPart;

  //  Limit the length of the provider hint. Work out how much space we need.
  const maxProviderWidth = terminalWidth - menuHint.length - 1;
  //  We could crop the provider details, but it looks weird, so instead if we
  //  can't fit it in just use elipses:
  //  const trimmedProviderHint =
  //    providerDetails.length > maxProviderWidth
  //      ? "..." + providerDetails.slice(-maxProviderWidth + 3)
  //      : providerDetails;

  //  If we can't fit the provider details, just show ellipsis
  if (providerDetails.length > maxProviderWidth) {
    const trimmedProviderHint = "...";
    const spaces = terminalWidth - menuHint.length - trimmedProviderHint.length;
    return colors.grey(menuHint + " ".repeat(spaces) + trimmedProviderHint);
  }

  //  Calculate spaces needed to right-align the provider details
  const spaces = terminalWidth - menuHint.length - providerDetails.length;

  //  Return the final hint - menu, space, provider (with model in white)
  return colors.grey(menuHint + " ".repeat(spaces) + providerPart) + modelPart;
}
