import { expandContext, ExpandedContext } from "./context";

describe("expandContext", () => {
  it("should expand the context template using environment variables", () => {
    const contextTemplate = "Hello, ${SHELL}!";
    const env = { SHELL: "bash" };
    const expandedValue = "Hello, bash!";

    const result: ExpandedContext = expandContext(contextTemplate, env);

    expect(result).toEqual({
      role: "user",
      name: "<Unnamed Context>",
      template: contextTemplate,
      context: expandedValue,
    });
  });

  it("should return the correct role, name, template, and expanded value", () => {
    //  Note the undefined environment variable value.
    const contextTemplate = "'${USER}' is using ${SHELL}";
    const env = { SHELL: "bash", USER: undefined };
    const expandedValue = "'' is using bash";

    const result: ExpandedContext = expandContext(contextTemplate, env);

    expect(result.role).toBe("user");
    expect(result.name).toBe("<Unnamed Context>");
    expect(result.template).toBe(contextTemplate);
    expect(result.context).toBe(expandedValue);
  });
});
