import expandEnvVars from "./expand-env-vars";

describe("expandEnvVars", () => {
  test("can expand simple var", () => {
    const expandedNoBraces = expandEnvVars("Hello $SHELL", { SHELL: "bash" });
    expect(expandedNoBraces).toBe("Hello bash");
    const expandedBraces = expandEnvVars("Hello ${SHELL}", { SHELL: "bash" });
    expect(expandedBraces).toBe("Hello bash");
  });

  test("expands undefined vars to empty strings", () => {
    const expanded = expandEnvVars("Hello $SHELL and $USER", {});
    expect(expanded).toBe("Hello  and ");
  });
});
