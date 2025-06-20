
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const generateJokeStep = createStep({
  id: "generate-joke-step",
  description: "Generates a joke based on a given word using OpenAI",
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    joke: z.string(),
  }),
  execute: async ({ inputData }) => {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Generating joke for word:", inputData.word);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a comedian who creates funny, clean jokes. Generate a short, witty joke based on the word provided. Keep it appropriate and clever.",
            },
            {
              role: "user",
              content: `Create a funny joke about or involving the word: ${inputData.word}`,
            },
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const joke = data.choices[0].message.content.trim();

      console.log("Joke generated:", joke);

      return {
        word: inputData.word,
        joke: joke,
      };
    } catch (error) {
      console.error("Error generating joke:", error);
      throw new Error(`Failed to generate joke: ${error.message}`);
    }
  },
});

export const jokeWorkflow = createWorkflow({
  id: "joke",
  description: "A workflow that generates jokes based on a given word using OpenAI",
  steps: [generateJokeStep],
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    joke: z.string(),
  }),
})
  .then(generateJokeStep)
  .commit();
