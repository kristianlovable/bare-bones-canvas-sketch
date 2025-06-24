


// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const wordAnalysisSchema = z.object({
  word: z.string(),
  length: z.number(),
});

// Step to analyze the word and prepare data for branching
const analyzeWord = createStep({
  id: "analyze-word",
  description: "Analyzes the input word and determines its length",
  inputSchema: z.object({
    word: z.string(),
  }),
  outputSchema: wordAnalysisSchema,
  execute: async ({ inputData }) => {
    console.log("Analyzing word:", inputData.word);
    
    return {
      word: inputData.word,
      length: inputData.word.length,
    };
  },
});

const processShortWordStep = createStep({
  id: "process-short-word",
  description: "Processes short words (5 characters or less)",
  inputSchema: wordAnalysisSchema,
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
      length: inputData.length,
      message: `"${inputData.word}" is a short word with ${inputData.length} characters.`,
    };
  },
});

const processLongWordStep = createStep({
  id: "process-long-word",
  description: "Processes long words (more than 5 characters)",
  inputSchema: wordAnalysisSchema,
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
      length: inputData.length,
      message: `"${inputData.word}" is a long word with ${inputData.length} characters.`,
    };
  },
});

export const wordLengthWorkflow = createWorkflow({
  id: "word-length",
  description: "A workflow that branches based on word length to categorize words as short or long",
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
  .then(analyzeWord)
  .branch([
    [
      async ({ inputData }) => {
        return inputData?.length <= 5;
      },
      processShortWordStep,
    ],
    [
      async ({ inputData }) => {
        return inputData?.length > 5;
      },
      processLongWordStep,
    ],
  ])
  .commit();


