import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { stream } from "jsr:@hono/hono/streaming";

// Use npm: prefix for Mastra imports to ensure proper resolution
const { getWorkflowByIdHandler, getWorkflowRunsHandler, createWorkflowRunHandler, startWorkflowRunHandler, getWorkflowsHandler } = await import("npm:@mastra/server@0.0.0-workflow-deno-20250616132510/handlers/workflows");
const { WorkflowRunState } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");

import { mastra } from "./src/mastra/index.ts";

// 
// You can set the basePath with Hono
const functionName = "api";
const app = new Hono().basePath(`/${functionName}`);

// Enable CORS for all origins to allow unauthenticated access
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey"],
  })
);

// Handle preflight requests
app.options("*", (c) => {
  return c.text("", 200);
});

app.get("workflows", async (c) => {
  console.log("Getting all workflows");
  try {
    const result = await getWorkflowsHandler({
      mastra,
    });
    return c.json(result);
  } catch (error) {
    console.error("Error getting workflows:", error);
    return c.json({ error: "Failed to get workflows" }, 500);
  }
});

app.get("workflows/:id", async (c) => {
  const id = c.req.param("id");
  console.log(`Getting workflow: ${id}`);
  try {
    const result = await getWorkflowByIdHandler({
      mastra,
      workflowId: id,
    });
    return c.json(result);
  } catch (error) {
    console.error("Error getting workflow:", error);
    return c.json({ error: "Workflow not found" }, 404);
  }
});

app.get("workflows/:id/runs", async (c) => {
  const id = c.req.param("id");
  console.log(`Getting workflow runs for: ${id}`);
  try {
    const result = await getWorkflowRunsHandler({
      mastra,
      workflowId: id,
    });
    return c.json(result);
  } catch (error) {
    console.error("Error getting workflow runs:", error);
    return c.json({ error: "Failed to get workflow runs" }, 500);
  }
});

app.post("workflows/:id/create-run", async (c) => {
  const id = c.req.param("id");
  const prevRunId = c.req.query("runId");
  console.log(`Creating run for workflow: ${id}, prevRunId: ${prevRunId}`);
  try {
    const result = await createWorkflowRunHandler({
      mastra,
      workflowId: id,
      runId: prevRunId,
    });
    return c.json(result);
  } catch (error) {
    console.error("Error creating workflow run:", error);
    return c.json(
      {
        error: "Failed to create run",
        details: error.message,
      },
      500
    );
  }
});

app.post("workflows/:id/start", async (c) => {
  const id = c.req.param("id");
  const { inputData } = await c.req.json();
  const runId = c.req.query("runId");
  console.log({ workflowId: id, runId, inputData });
  try {
    const result = await startWorkflowRunHandler({
      mastra,
      workflowId: id,
      inputData,
      runId,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return c.json(result);
  } catch (error) {
    console.error("Error starting workflow run:", error);
    return c.json(
      {
        error: "Failed to start run",
        details: error.message,
      },
      500
    );
  }
});

app.get("workflows/:id/watch", (c) => {
  try {
    console.log("watch workflow");
    const logger = mastra.getLogger();
    const id = c.req.param("id");
    const runId = c.req.query("runId");

    if (!runId) {
      throw new HTTPException(400, {
        message: "runId required to watch workflow",
      });
    }

    const seenSnapshots = new Set<number>();
    return stream(
      c,
      async (stream) => {
        try {
          const storage = mastra.getStorage();
          if (!storage) {
            throw new HTTPException(500, {
              message: "Storage not found",
            });
          }

          let i = 0;
          let snapshot: WorkflowRunState | null = null;
          // Polling datatabse for status, need to implement some kind of pubsub to make it work in Deno,
          // Works for now, just not perfect
          while (
            snapshot === null ||
            (snapshot.status !== "success" && snapshot.status !== "failed")
          ) {
            console.log("load snapshot", { id, runId, i });

            snapshot = await storage!.loadWorkflowSnapshot({
              workflowName: id,
              runId,
            });

            if (!snapshot) {
              throw new HTTPException(500, {
                message: "Snapshot not found",
              });
            }

            const chunk = {
              type: "watch",
              payload: {
                // not supported now...
                // currentStep: {
                //   id: "test-step",
                //   status: "running",
                //   payload: {
                //     city: "Ibadan",
                //   },
                //   startedAt: 1750253045265,
                // },
                result: snapshot.result,
                error: snapshot.error,
                workflowState: {
                  status: snapshot.status,
                  steps: snapshot.context,
                  result: snapshot.result,
                  error: snapshot.error,
                },
              },
              eventTimestamp: snapshot.timestamp,
              runId,
            };

            // console.log("chunk", chunk);
            if (!seenSnapshots.has(chunk.eventTimestamp)) {
              await stream.write(JSON.stringify(chunk) + "\x1E");
              seenSnapshots.add(chunk.eventTimestamp);
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
          console.log("done");
        } catch (err) {
          console.log("error????");
          mastra
            .getLogger()
            .error(
              "Error in watch stream: " +
                ((err as Error)?.message ?? "Unknown error")
            );
        }
      },
      async (err) => {
        console.log("wtf???");
        logger.error("Error in watch stream: " + err?.message);
      }
    );
  } catch (error) {
    console.log("error", error);
    return c.json(
      {
        error: "Failed to watch workflow",
      },
      500
    );
  }
});

Deno.serve(app.fetch);
