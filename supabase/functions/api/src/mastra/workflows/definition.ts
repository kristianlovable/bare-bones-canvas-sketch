
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const getDefinitionStep = createStep({
  id: "get-definition-step",
  description: "Gets the definition of a word using OpenAI",
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    definition: z.string(),
  }),
  execute: async ({ inputData }) => {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Getting definition for word:", inputData.word);

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
              content: "You are a dictionary assistant. Provide clear, concise definitions for words. Return only the definition without additional commentary.",
            },
            {
              role: "user",
              content: `Define the word: ${inputData.word}`,
            },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const definition = data.choices[0].message.content.trim();

      console.log("Definition received:", definition);

      return {
        word: inputData.word,
        definition: definition,
      };
    } catch (error) {
      console.error("Error getting definition:", error);
      throw new Error(`Failed to get definition: ${error.message}`);
    }
  },
});

export const definitionWorkflow = createWorkflow({
  id: "definition",
  description: "A workflow that gets word definitions using OpenAI",
  steps: [getDefinitionStep],
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    definition: z.string(),
  }),
})
  .then(getDefinitionStep)
  .commit();
