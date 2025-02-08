export default function expandEnvVars(
  text: string,
  env: NodeJS.ProcessEnv,
): string {
  return text.replace(/\${?(\w+)}?/g, (_, key) => env[key] || "");
}
