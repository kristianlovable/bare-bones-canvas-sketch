// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

// Step 1: Research the topic using web search
const researchTopicStep = createStep({
  id: "research-topic-step",
  description: "Searches the web for information about the given topic",
  inputSchema: z.object({
    topic: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    researchData: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    console.log("Researching topic:", inputData.topic);
    console.log("Mastra object:", !!mastra);
    console.log("Mastra tools:", mastra ? Object.keys(mastra.tools || {}) : "no mastra");

    try {
      // Direct access to the web search tool
      const webSearchTool = mastra?.tools?.["web-search"];
      
      if (!webSearchTool) {
        console.log("Web search tool not found in mastra.tools");
        console.log("Available tools:", mastra ? Object.keys(mastra.tools || {}) : "none");
        return {
          topic: inputData.topic,
          researchData: `Research topic: ${inputData.topic}. Web search tool not available in tools: ${mastra ? Object.keys(mastra.tools || {}).join(', ') : 'no mastra'}`,
        };
      }

      console.log("Found web search tool, executing search...");

      const searchResult = await webSearchTool.execute({
        context: `${inputData.topic} latest information facts trends`,
        mastra,
      });

      console.log("Search result:", searchResult);

      // Convert search results to string format
      const researchDataString = Array.isArray(searchResult.results) 
        ? searchResult.results.map(result => `Title: ${result.title}\nContent: ${result.content}`).join('\n\n')
        : JSON.stringify(searchResult.results);

      return {
        topic: inputData.topic,
        researchData: researchDataString || "No research data found",
      };
    } catch (error) {
      console.error("Error during research:", error);
      // Return fallback data instead of throwing error
      return {
        topic: inputData.topic,
        researchData: `Research topic: ${inputData.topic}. Error occurred during research: ${error.message}`,
      };
    }
  },
});

// Step 2: Analyze and structure the research data
const analyzeDataStep = createStep({
  id: "analyze-data-step",
  description: "Analyzes the research data and extracts key insights",
  inputSchema: z.object({
    topic: z.string(),
    researchData: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    keyInsights: z.string(),
    structuredData: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("Analyzing research data for topic:", inputData.topic);

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

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
              content: "You are a data analyst. Extract key insights and structure the research data into clear, organized sections. Focus on the most important and interesting information.",
            },
            {
              role: "user",
              content: `Analyze this research data about "${inputData.topic}" and extract key insights:\n\n${inputData.researchData}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content.trim();

      console.log("Data analysis completed");

      return {
        topic: inputData.topic,
        keyInsights: analysis,
        structuredData: `Topic: ${inputData.topic}\n\nResearch Data:\n${inputData.researchData}\n\nKey Insights:\n${analysis}`,
      };
    } catch (error) {
      console.error("Error analyzing data:", error);
      throw new Error(`Failed to analyze data: ${error.message}`);
    }
  },
});

// Step 3: Use AI agent to create engaging content
const createContentStep = createStep({
  id: "create-content-step",
  description: "Uses the content agent to create engaging content based on the structured data",
  inputSchema: z.object({
    topic: z.string(),
    keyInsights: z.string(),
    structuredData: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    finalContent: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    console.log("Creating content with AI agent for topic:", inputData.topic);

    try {
      // Try multiple ways to access the content agent
      let agent = null;
      
      // Method 1: Direct access via agents property
      if (mastra?.agents && mastra.agents["contentAgent"]) {
        agent = mastra.agents["contentAgent"];
      }
      // Method 2: Access via getAgents method if it exists
      else if (mastra?.getAgents) {
        const agents = mastra.getAgents();
        agent = agents["contentAgent"];
      }
      
      if (!agent) {
        throw new Error("Content agent not found");
      }

      const prompt = `Based on the following research and analysis, create engaging, well-structured content about "${inputData.topic}":

${inputData.structuredData}

Please create compelling content that:
- Has a catchy introduction
- Presents the key information in an organized way
- Includes interesting facts and insights
- Has a strong conclusion
- Is engaging and easy to read`;

      const response = await agent.generate([
        {
          role: "user",
          content: prompt,
        },
      ], {
        maxSteps: 2,
      });

      const finalContent = response.text;

      console.log("Content created successfully with AI agent");

      return {
        topic: inputData.topic,
        finalContent: finalContent,
      };
    } catch (error) {
      console.error("Error creating content with agent:", error);
      throw new Error(`Failed to create content: ${error.message}`);
    }
  },
});

export const contentCreationWorkflow = createWorkflow({
  id: "content-creation",
  description: "A multi-step workflow that researches a topic, analyzes data, and creates engaging content using an AI agent",
  steps: [researchTopicStep, analyzeDataStep, createContentStep],
  inputSchema: z.object({
    topic: z.string(),
  }),
  outputSchema: z.object({
    topic: z.string(),
    finalContent: z.string(),
  }),
})
  .then(researchTopicStep)
  .then(analyzeDataStep)
  .then(createContentStep)
  .commit();
