import colors from "colors";
import { stripFormatting } from "../lib/markdown";

export function printConfigValue(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value: any,
  interactive: boolean,
  indentLevel: number,
) {
  const arrayIndent = "  ".repeat(indentLevel + 1);
  if (Array.isArray(value)) {
    return value.map((v) => `\n${arrayIndent}- ${JSON.stringify(v)}`).join("");
  } else if (value !== null && typeof value === "object") {
    //  Objects are recursively printed.
    return "\n" + printConfig(value, interactive, indentLevel + 1);
  } else {
    return JSON.stringify(value, null, 2);
  }
}

export function printConfig(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  config: { [key: string]: any },
  interactive: boolean,
  indentLevel = 0,
  // maxWidth?: number,
): string {
  const indent = "  ".repeat(indentLevel);
  const val: string[] = [];
  for (const [key, value] of Object.entries(config)) {
    const valueStr = printConfigValue(value, interactive, indentLevel);

    //Crop to terminal width (if provided)
    // if (maxWidth) {
    //   valueStr = valueStr
    //     .split("\n")
    //     .map((line) =>
    //       line.length > maxWidth
    //         ? line.substring(0, maxWidth - 3) + "..."
    //         : line,
    //     )
    //     .join("\n");
    // }

    const output = `${indent}${colors.yellow(key)}: ${colors.cyan(valueStr)}`;
    val.push(interactive ? output : stripFormatting(output));
  }
  return val.join("\n");
}
