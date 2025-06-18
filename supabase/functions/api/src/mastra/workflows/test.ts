
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const cityCoordinatesStep = createStep({
  id: "test-step",
  description: "Gets the city name and puts it in all caps",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    city_name: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      city_name: inputData.city.toUpperCase(),
    };
  },
});

const step2 = createStep({
  id: "test-step2",
  description: "Gets the city name and reverses it",
  inputSchema: z.object({
    city_name: z.string(),
  }),
  outputSchema: z.object({
    name_city: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("test-step2", inputData);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      name_city: inputData.city_name.split("").reverse().join(""),
    };
  },
});

export const dummyWorkflow = createWorkflow({
  id: "dummy",
  description: "A dummy workflow to test visualisation",
  steps: [cityCoordinatesStep, step2],
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    name_city: z.string(),
  }),
})
  .then(cityCoordinatesStep)
  .then(step2)
  .commit();
