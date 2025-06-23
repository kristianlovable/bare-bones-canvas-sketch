
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const evenNumberStep = createStep({
  id: "even-number-step",
  description: "Processes even numbers and provides information about them",
  inputSchema: z.object({
    number: z.number(),
  }),
  outputSchema: z.object({
    number: z.number(),
    type: z.string(),
    message: z.string(),
    divisibleBy: z.array(z.number()),
  }),
  execute: async ({ inputData }) => {
    const { number } = inputData;
    
    // Find divisors for even numbers
    const divisors = [];
    for (let i = 2; i <= Math.min(number, 10); i++) {
      if (number % i === 0) {
        divisors.push(i);
      }
    }

    console.log(`Processing even number: ${number}`);

    return {
      number,
      type: "even",
      message: `${number} is an even number! Even numbers are divisible by 2.`,
      divisibleBy: divisors,
    };
  },
});

const oddNumberStep = createStep({
  id: "odd-number-step",
  description: "Processes odd numbers and provides information about them",
  inputSchema: z.object({
    number: z.number(),
  }),
  outputSchema: z.object({
    number: z.number(),
    type: z.string(),
    message: z.string(),
    isPrime: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { number } = inputData;
    
    // Check if the odd number is prime
    const isPrime = (num: number): boolean => {
      if (num < 2) return false;
      if (num === 2) return true;
      if (num % 2 === 0) return false;
      
      for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
      }
      return true;
    };

    console.log(`Processing odd number: ${number}`);

    return {
      number,
      type: "odd",
      message: `${number} is an odd number! ${isPrime(number) ? 'It is also a prime number.' : 'It is not a prime number.'}`,
      isPrime: isPrime(number),
    };
  },
});

export const numberClassifierWorkflow = createWorkflow({
  id: "number-classifier",
  description: "A workflow that classifies numbers as even or odd and provides different information based on the classification",
  inputSchema: z.object({
    number: z.number(),
  }),
  outputSchema: z.union([
    z.object({
      number: z.number(),
      type: z.literal("even"),
      message: z.string(),
      divisibleBy: z.array(z.number()),
    }),
    z.object({
      number: z.number(),
      type: z.literal("odd"),
      message: z.string(),
      isPrime: z.boolean(),
    }),
  ]),
})
  .branch([
    // Branch for even numbers
    [
      async ({ inputData }) => {
        return inputData.number % 2 === 0;
      },
      evenNumberStep,
    ],
    // Branch for odd numbers  
    [
      async ({ inputData }) => {
        return inputData.number % 2 !== 0;
      },
      oddNumberStep,
    ],
  ])
  .commit();
