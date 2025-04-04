import colors from "colors/safe";
import { formatChatMenuHint } from "./format-chat-menu-hint";
import { ProviderConfiguration } from "../configuration/configuration";
describe("ui", () => {
  describe("chatMenuHint", () => {
    it("should show 'actions' by default", () => {
      const hint = formatChatMenuHint(80);
      expect(hint).toBe(`${colors.grey("<Enter> Menu")}`);
    });

    it("should show the model only for a root provider", () => {
      const provider: ProviderConfiguration = {
        name: "", // i.e. root
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(80, provider);
      expect(hint).toBe(
        `${colors.grey("<Enter> Menu                                                     gpt-4.5-preview")}`,
      );
    });

    it("should show the model and provider name for a non root provider", () => {
      const provider: ProviderConfiguration = {
        name: "openai",
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(80, provider);
      expect(hint).toBe(
        `${colors.grey("<Enter> Menu                                             openai: gpt-4.5-preview")}`,
      );
    });

    it("should trim the provider details if needed", () => {
      const provider: ProviderConfiguration = {
        name: "openai",
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(20, provider);
      expect(hint).toBe(`${colors.grey("<Enter> Menu     ...")}`);
    });
  });
});
