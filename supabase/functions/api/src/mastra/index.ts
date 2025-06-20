// Use dynamic imports with npm: prefix for better compatibility
const { Mastra } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/mastra");
const { PostgresStore } = await import("npm:@mastra/pg@0.0.0-workflow-deno-20250616132510");
import { dummyWorkflow } from "./workflows/test.ts";
import { definitionWorkflow } from "./workflows/definition.ts";
import { issueTriageWorkflow } from "./workflows/issue-triage.ts";
import { jokeWorkflow } from "./workflows/joke.ts";

// Fetch SUPABASE_DB_URL from edge function secrets/environment
const supabaseDbUrl = Deno.env.get("SUPABASE_DB_URL");

console.log("SUPABASE_DB_URL exists:", !!supabaseDbUrl);
console.log("SUPABASE_DB_URL preview:", supabaseDbUrl ? supabaseDbUrl.substring(0, 20) + "..." : "undefined");

if (!supabaseDbUrl) {
  throw new Error("SUPABASE_DB_URL environment variable is not set");
}

const storage = new PostgresStore({
  connectionString: supabaseDbUrl,
});

export const mastra = new Mastra({
  storage,
  workflows: {
    dummy: dummyWorkflow,
    definition: definitionWorkflow,
    "issue-triage": issueTriageWorkflow,
    joke: jokeWorkflow,
  },
});
