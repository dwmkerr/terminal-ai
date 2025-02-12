export async function writeClipboard(
  content: string,
  showConfirmation: boolean,
) {
  const clipboard = (await import("clipboardy")).default;
  clipboard.writeSync(content);
  if (showConfirmation) {
    console.log(`✅ Copied to clipboard!`);
  }
}
