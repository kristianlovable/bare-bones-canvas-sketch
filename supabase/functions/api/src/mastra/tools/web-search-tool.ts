
// Use dynamic imports with npm: prefix
const { createTool } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/tools");
const { z } = await import("npm:zod");

export const webSearchTool = createTool({
  id: "web-search",
  description: "Searches the web for information about a topic to gather context and facts",
  inputSchema: z.object({
    query: z.string().describe("The search query to find information about"),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
    
    if (!tavilyApiKey) {
      throw new Error("Tavily API key not found");
    }

    console.log("Searching web for:", context.query);

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: context.query,
          search_depth: "basic",
          include_answer: false,
          max_results: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      const searchResults = data.results?.slice(0, 5).map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content.substring(0, 300), // Limit content length
      })) || [];

      console.log("Web search completed, found results:", searchResults.length);

      return {
        results: searchResults,
      };
    } catch (error) {
      console.error("Error in web search:", error);
      // Return empty results if search fails
      return {
        results: [],
      };
    }
  },
});
