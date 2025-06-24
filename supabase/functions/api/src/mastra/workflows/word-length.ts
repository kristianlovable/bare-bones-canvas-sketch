
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const processShortWordStep = createStep({
  id: "process-short-word",
  description: "Processes short words (5 characters or less)",
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    category: z.string(),
    length: z.number(),
    message: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("Processing short word:", inputData.word);
    
    return {
      word: inputData.word,
      category: "short",
      length: inputData.word.length,
      message: `"${inputData.word}" is a short word with ${inputData.word.length} characters.`,
    };
  },
});

const processLongWordStep = createStep({
  id: "process-long-word",
  description: "Processes long words (more than 5 characters)",
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    category: z.string(),
    length: z.number(),
    message: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("Processing long word:", inputData.word);
    
    return {
      word: inputData.word,
      category: "long",
      length: inputData.word.length,
      message: `"${inputData.word}" is a long word with ${inputData.word.length} characters.`,
    };
  },
});

export const wordLengthWorkflow = createWorkflow({
  id: "word-length",
  description: "A workflow that branches based on word length to categorize words as short or long",
  steps: [processShortWordStep, processLongWordStep],
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: z.object({
    word: z.string(),
    category: z.string(),
    length: z.number(),
    message: z.string(),
  }),
})
  .branch([
    [async ({ inputData }) => inputData.word.length <= 5, processShortWordStep],
    [async ({ inputData }) => inputData.word.length > 5, processLongWordStep]
  ])
  .commit();
