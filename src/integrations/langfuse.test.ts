import { getDefaultConfiguration } from "../configuration/configuration";
import { integrateLangfuse } from "./langfuse";

describe("integrations", () => {
  describe("langfuse", () => {
    test("with no langfuse config; no integration is created", () => {
      const config = getDefaultConfiguration();
      const integration = integrateLangfuse(config);
      expect(integration).toBeUndefined();
    });

    test("with langfuse config; integration, client and trace is created", () => {
      const config = getDefaultConfiguration();
      config.integrations.langfuse = {
        secretKey: "sk",
        publicKey: "pk",
        baseUrl: "bu",
        traceName: "tn",
      };
      const integration = integrateLangfuse(config);
      expect(integration).not.toBeUndefined();
      expect(integration?.langfuse).not.toBeUndefined();
      expect(integration?.trace).not.toBeUndefined();
    });
  });
});
