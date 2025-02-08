import os from "os";

export function hydrateContextEnvironmentVariables() {
  process.env["OS_PLATFORM"] = os.platform();
  process.env["TTY_WIDTH"] = `${process.stdout.columns || 80}`;
  process.env["TTY_HEIGHT"] = `${process.stdout.rows || 24}`;
}
