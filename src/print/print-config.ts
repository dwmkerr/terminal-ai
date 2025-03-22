import colors from "colors";
import { stripFormatting } from "../lib/markdown";

// interface ConfigItem {
//   name: string;
//   value: any;
//   sensitive?: boolean;
//   overridden?: "env" | "cli";
// }
//

export function printConfigValue(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value: any,
  interactive: boolean,
  indentLevel: number,
  maxWidth?: number,
) {
  const arrayIndent = "  ".repeat(indentLevel + 1);
  const sensitive =
    value.hasOwnProperty("sensitive") && value["sensitive"] === true;
  if (Array.isArray(value)) {
    return value.map((v) => `\n${arrayIndent}- ${JSON.stringify(v)}`).join("");
  } else if (value !== null && typeof value === "object") {
    //  Objects are recursively printed.
    return "\n" + printConfig(value, interactive, indentLevel + 1, maxWidth);
  } else {
    return sensitive ? "***masked***" : JSON.stringify(value, null, 2);
  }
}

export function printConfig(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  config: { [key: string]: any },
  interactive: boolean,
  indentLevel = 0,
  maxWidth?: number,
): string {
  const indent = "  ".repeat(indentLevel);
  const val: string[] = [];
  for (const [key, value] of Object.entries(config)) {
    // const item: ConfigItem = { name: key, value };
    const setBy = value.hasOwnProperty("setBy")
      ? (value["setBy"] as string)
      : "";

    //Override color based on overridden flag
    let nameColor = colors.yellow;
    if (setBy) {
      if (setBy === "env") {
        nameColor = colors.green;
      } else if (setBy === "cli") {
        nameColor = colors.blue;
      }
    }

    let valueStr = printConfigValue(value, interactive, indentLevel);

    //Crop to terminal width (if provided)
    if (maxWidth) {
      valueStr = valueStr
        .split("\n")
        .map((line) =>
          line.length > maxWidth
            ? line.substring(0, maxWidth - 3) + "..."
            : line,
        )
        .join("\n");
    }

    const output = `${indent}${nameColor(key)}: ${colors.cyan(valueStr)}`;
    val.push(interactive ? output : stripFormatting(output));
  }
  return val.join("\n");
}
