import { getDefaultConfiguration } from "./configuration";
import { enrichProperty } from "./utils";

describe("configuration", () => {
  describe("utils", () => {
    describe("enrichProperty", () => {
      test("can enrich a deeply nested property", () => {
        //  Create default config - assert that it has no langfuse integration.
        const config = getDefaultConfiguration();
        expect(config.integrations.langfuse).toBeUndefined();

        //  Deeply set some values.
        enrichProperty(config, "integrations.langfuse.traceName", "tracename");
        expect(config.integrations.langfuse?.traceName).toBe("tracename");
      });
    });
  });
});
