
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

const summarizeUserReportStep = createStep({
  id: "summarize-user-report",
  description: "Summarizes user support message into structured format",
  inputSchema: z.object({
    userMessage: z.string(),
  }),
  outputSchema: z.object({
    problemDescription: z.string(),
    productArea: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Summarizing user report:", inputData.userMessage.substring(0, 100) + "...");

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
              content: `You are a technical support analyst. Analyze user reports and extract structured information.

Return ONLY a valid JSON object with:
- problemDescription: Clear description of the issue
- productArea: Module/area affected (e.g., "Authentication", "Payment", "UI", "API", "Database")
- severity: One of "low", "medium", "high", "critical"
- summary: Brief summary for internal use

Do not wrap the JSON in markdown code blocks. Return only the JSON.`,
            },
            {
              role: "user",
              content: `Analyze this user report: ${inputData.userMessage}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content.trim();

      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        responseText = jsonMatch[1];
      }

      // Clean up any remaining markdown formatting
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

      const result = JSON.parse(responseText);

      console.log("User report summarized:", result);

      return result;
    } catch (error) {
      console.error("Error summarizing user report:", error);
      throw new Error(`Failed to summarize report: ${error.message}`);
    }
  },
});

const webSearchStep = createStep({
  id: "web-search",
  description: "Searches the web for relevant context using Tavily",
  inputSchema: z.object({
    problemDescription: z.string(),
    productArea: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    summary: z.string(),
  }),
  outputSchema: z.object({
    searchResults: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    })),
    problemDescription: z.string(),
    productArea: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
    
    if (!tavilyApiKey) {
      throw new Error("Tavily API key not found");
    }

    console.log("Searching web for:", inputData.summary);

    try {
      const searchQuery = `${inputData.productArea} ${inputData.problemDescription} stackoverflow github`;
      
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: searchQuery,
          search_depth: "advanced",
          include_answer: false,
          include_domains: ["stackoverflow.com", "github.com", "reddit.com"],
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
        content: result.content.substring(0, 300),
      })) || [];

      console.log("Web search completed, found results:", searchResults.length);

      return {
        searchResults,
        ...inputData,
      };
    } catch (error) {
      console.error("Error in web search:", error);
      // Continue with empty results if search fails
      return {
        searchResults: [],
        ...inputData,
      };
    }
  },
});

const draftEscalationStep = createStep({
  id: "draft-escalation",
  description: "Creates internal triage summary with recommendations",
  inputSchema: z.object({
    searchResults: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    })),
    problemDescription: z.string(),
    productArea: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    summary: z.string(),
  }),
  outputSchema: z.object({
    escalationNote: z.string(),
    searchResults: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    })),
    severity: z.enum(["low", "medium", "high", "critical"]),
  }),
  execute: async ({ inputData }) => {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Drafting escalation summary for:", inputData.productArea);

    try {
      const contextText = inputData.searchResults.map(result => 
        `${result.title}: ${result.content}`
      ).join("\n\n");

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
              content: `You are an engineering manager creating internal triage notes. Write a concise summary that includes:

1. What the issue is
2. What's likely causing it
3. Suggested next actions
4. Reference external context if helpful

Keep it professional and actionable. Format as markdown.`,
            },
            {
              role: "user",
              content: `Create triage note for:

Issue Summary: ${inputData.summary}
Product Area: ${inputData.productArea}
Severity: ${inputData.severity}
Description: ${inputData.problemDescription}

External Context:
${contextText}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const escalationNote = data.choices[0].message.content.trim();

      console.log("Escalation note drafted");

      return {
        escalationNote,
        searchResults: inputData.searchResults,
        severity: inputData.severity,
      };
    } catch (error) {
      console.error("Error drafting escalation:", error);
      throw new Error(`Failed to draft escalation: ${error.message}`);
    }
  },
});

const slackNotificationStep = createStep({
  id: "slack-notification",
  description: "Sends notification to Slack via webhook",
  inputSchema: z.object({
    escalationNote: z.string(),
    searchResults: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
    })),
    severity: z.enum(["low", "medium", "high", "critical"]),
  }),
  outputSchema: z.object({
    notificationSent: z.boolean(),
    escalationNote: z.string(),
  }),
  execute: async ({ inputData }) => {
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    
    if (!slackWebhookUrl) {
      throw new Error("Slack webhook URL not found");
    }

    console.log("Sending Slack notification for severity:", inputData.severity);

    try {
      const severityEmoji = {
        low: "🟢",
        medium: "🟡", 
        high: "🟠",
        critical: "🔴"
      }[inputData.severity];

      const externalLinks = inputData.searchResults.length > 0 
        ? `\n\n*External Context:*\n${inputData.searchResults.map(r => `• <${r.url}|${r.title}>`).join('\n')}`
        : '';

      const slackMessage = {
        text: `${severityEmoji} Issue Triage Alert - ${inputData.severity.toUpperCase()} Severity`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${severityEmoji} Issue Triage Alert - ${inputData.severity.toUpperCase()} Severity`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: inputData.escalationNote + externalLinks
            }
          }
        ]
      };

      const response = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook error: ${response.status}`);
      }

      console.log("Slack notification sent successfully");

      return {
        notificationSent: true,
        escalationNote: inputData.escalationNote,
      };
    } catch (error) {
      console.error("Error sending Slack notification:", error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  },
});

export const issueTriageWorkflow = createWorkflow({
  id: "issue-triage",
  description: "Triages critical user issues with AI analysis, web search, and Slack notifications",
  steps: [summarizeUserReportStep, webSearchStep, draftEscalationStep, slackNotificationStep],
  inputSchema: z.object({
    userMessage: z.string(),
  }),
  outputSchema: z.object({
    notificationSent: z.boolean(),
    escalationNote: z.string(),
  }),
})
  .then(summarizeUserReportStep)
  .then(webSearchStep)
  .then(draftEscalationStep)
  .then(slackNotificationStep)
  .commit();
