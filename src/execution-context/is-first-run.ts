import { ProviderConfiguration } from "../configuration/configuration";

/**
 * isFirstRun - determines from config whether we should do first run
 * initialisation, such as asking for a key.
 *
 * @param {ProviderConfiguration} provider - the provider loaded from config.
 * @returns {boolean} true if we should treat this as a first run.
 */
export function isFirstRun(provider: ProviderConfiguration): boolean {
  //  The most common indicator we're a first run - the root provider and
  //  no api key.
  if (provider.name === "" && provider.apiKey === "") {
    return true;
  }

  //  TODO: we should really check for model and baseurl as well.
  //  More unusual - someone has explicitly blatted the baseUrl in config.
  //  Without the baseurl we cannot run.
  if (provider.baseURL === "") {
    return true;
  }

  return false;
}
