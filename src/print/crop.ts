export function crop(value: string, length: number): string {
  return value.length > length ? value.substring(0, length - 3) + "..." : value;
}

export function cropLines(lines: string, length: number): string {
  //  If we don't need to crop, we're done.
  const splitLines = lines.split("\n");
  if (splitLines.length <= length) {
    return lines;
  }

  const output = splitLines.slice(0, length - 1).join("\n");
  return `${output}\n...`;
}
