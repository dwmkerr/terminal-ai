import expandEnvVars from "./expand-env-vars";

describe("expandEnvVars", () => {
  test("can expand simple var", () => {
    const expandedNoBraces = expandEnvVars("Hello $SHELL", { SHELL: "bash" });
    expect(expandedNoBraces).toBe("Hello bash");
    const expandedBraces = expandEnvVars("Hello ${SHELL}", { SHELL: "bash" });
    expect(expandedBraces).toBe("Hello bash");
  });
});
