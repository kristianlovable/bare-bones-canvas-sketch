
// Use dynamic imports with npm: prefix for better compatibility
const { Mastra } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/mastra");
const { PostgresStore } = await import("npm:@mastra/pg@0.0.0-workflow-deno-20250616132510");
import process from "node:process";
import { dummyWorkflow } from "./workflows/test.ts";

console.log(process.env.SUPABASE_DB_URL);
const storage = new PostgresStore({
  connectionString: process.env.SUPABASE_DB_URL!,
});

export const mastra = new Mastra({
  storage,
  workflows: {
    dummy: dummyWorkflow,
  },
});
