import { Configuration } from "../configuration/configuration";

/**
 * isFirstRun - determines from config whether we should do first run
 * initialisation, such as asking for a key.
 *
 * @param {Configuration} config - all config loaded from files/env/etc.
 * @returns {boolean} true if we should treat this as a first run.
 */
export function isFirstRun(config: Configuration): boolean {
  //  The most common indicator we're a first run - no api key.
  if (config.apiKey === "") {
    return true;
  }

  //  More unusual - someone has explicitly blatted the baseUrl in config.
  //  Without the baseurl we cannot run.
  if (config.baseURL === "") {
    return true;
  }

  return false;
}
