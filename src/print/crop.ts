export function crop(value: string, length: number): string {
  return value.length > length ? value.substring(0, length - 3) + "..." : value;
}
