import os from "os";

/**
 * hydrateContextEnvironmentVariables
 *
 * Updates the given environment with the additional environment variables,
 * such as OS_PLATFORM and TTY_WIDTH, provided by Terminal AI that can be
 * useful when later on hydrating
 * files
 *
 * @param {NodeJS.ProcessEnv} env - the environment to hydrate, typically
 * just 'process.env'.
 */
export function hydrateContextEnvironmentVariables(env: NodeJS.ProcessEnv) {
  env["OS_PLATFORM"] = os.platform();
  env["TTY_WIDTH"] = `${process.stdout.columns || 80}`;
  env["TTY_HEIGHT"] = `${process.stdout.rows || 24}`;
}
