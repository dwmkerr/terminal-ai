import { password } from "@inquirer/prompts";

export async function inputApiKey(existingKey?: string) {
  //  If there is no existing key, we require input.
  if (!existingKey) {
    return await password({
      mask: true,
      message: "API Key:",
      validate: (key) => (key === "" ? "API key is required" : true),
    });
  }

  //  If there is an existing key, hint that we keep it by entering nothing.
  const key = await password({
    mask: true,
    message: "API Key (<Enter> to keep existing key):",
  });
  return key || existingKey;
}
