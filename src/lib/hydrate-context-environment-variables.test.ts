import os from "os";
import { hydrateContextEnvironmentVariables } from "./hydrate-context-environment-variables";

describe("lib", () => {
  describe("hydrateContextEnvironmentVariables", () => {
    test("can hydrate context environment variables", () => {
      //  Hydrate an environment.
      const env = {};
      hydrateContextEnvironmentVariables(env);

      //  Validate we have the expected properties added.
      expect(env).toHaveProperty("OS_PLATFORM", os.platform());

      //  Note that our width/height are strings, as is standard for env vars.
      expect(env).toHaveProperty(
        "TTY_WIDTH",
        `${process.stdout.columns || 80}`,
      );
      expect(env).toHaveProperty("TTY_HEIGHT", `${process.stdout.rows || 24}`);
    });
  });
});
