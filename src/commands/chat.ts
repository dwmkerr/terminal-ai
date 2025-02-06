import OpenAI from "openai";

export async function chat(openAiApiKey: string, input: string) {
  const openai = new OpenAI({
    apiKey: openAiApiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: input }],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      console.log(response);
    } else {
      console.error("No response received from ChatGPT");
    }
  } catch (error) {
    console.error("Error calling ChatGPT:", error);
  }
}
