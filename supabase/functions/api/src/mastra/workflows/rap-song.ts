
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const generateRapSongStep = createStep({
  id: "generate-rap-song-step",
  description: "Generates a rap song based on a given theme or topic using the rap agent",
  inputSchema: z.object({
    theme: z.string(),
  }),
  outputSchema: z.object({
    theme: z.string(),
    rapSong: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    console.log("Generating rap song for theme:", inputData.theme);

    const agent = mastra?.getAgent("rapAgent");
    if (!agent) {
      throw new Error("Rap agent not found");
    }

    try {
      const prompt = `Create an original rap song about: ${inputData.theme}

Make it creative, engaging, and full of clever wordplay. Include a catchy hook and maintain good flow throughout.`;

      const response = await agent.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);

      const rapSong = response.text;

      console.log("Rap song generated successfully");

      return {
        theme: inputData.theme,
        rapSong: rapSong,
      };
    } catch (error) {
      console.error("Error generating rap song:", error);
      throw new Error(`Failed to generate rap song: ${error.message}`);
    }
  },
});

export const rapSongWorkflow = createWorkflow({
  id: "rap-song",
  description: "A workflow that generates rap songs based on a given theme using AI",
  steps: [generateRapSongStep],
  inputSchema: z.object({
    theme: z.string(),
  }),
  outputSchema: z.object({
    theme: z.string(),
    rapSong: z.string(),
  }),
})
  .then(generateRapSongStep)
  .commit();
