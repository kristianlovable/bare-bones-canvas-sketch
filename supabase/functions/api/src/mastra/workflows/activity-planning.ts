
// Use dynamic imports with npm: prefix
const { createWorkflow, createStep } = await import("npm:@mastra/core@0.0.0-workflow-deno-20250616132510/workflows");
const { z } = await import("npm:zod");

// Helper function to convert weather codes to human-readable conditions
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
  };
  return conditions[code] || "Unknown";
}

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
});

// Step to fetch weather data for a given city
const fetchWeather = createStep({
  id: "fetch-weather",
  description: "Fetches weather forecast for a given city",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("Fetching weather for:", inputData.city);

    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();

    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m.slice(0, 24)),
      minTemp: Math.min(...data.hourly.temperature_2m.slice(0, 24)),
      condition: getWeatherCondition(data.current.weathercode),
      location: name,
      precipitationChance: data.hourly.precipitation_probability.slice(0, 24).reduce(
        (acc: number, curr: number) => Math.max(acc, curr),
        0,
      ),
    };

    console.log("Weather forecast:", forecast);
    return forecast;
  },
});

// Step to plan activities based on weather conditions
const planActivities = createStep({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;

    if (!forecast) {
      throw new Error("Forecast data not found");
    }

    console.log("Planning activities for good weather conditions");

    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      Date: ${forecast.date}
      Temperature: ${forecast.minTemp}°C to ${forecast.maxTemp}°C
      Conditions: ${forecast.condition}
      Precipitation chance: ${forecast.precipitationChance}%
      `;

    const agent = mastra?.getAgent("planningAgent");
    if (!agent) {
      throw new Error("Planning agent not found");
    }

    const response = await agent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);

    return {
      activities: response.text,
    };
  },
});

// Step to plan indoor activities only
const planIndoorActivities = createStep({
  id: "plan-indoor-activities",
  description: "Suggests indoor activities when precipitation is high",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;

    if (!forecast) {
      throw new Error("Forecast data not found");
    }

    console.log("Planning indoor activities due to high precipitation chance");

    const prompt = `Due to high precipitation (${forecast.precipitationChance}% chance), plan indoor activities for ${forecast.location} on ${forecast.date}. Focus on museums, shopping centers, indoor entertainment, restaurants, and covered venues.`;

    const agent = mastra?.getAgent("planningAgent");
    if (!agent) {
      throw new Error("Planning agent not found");
    }

    const response = await agent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);

    return {
      activities: response.text,
    };
  },
});

// Main workflow with conditional branching
export const activityPlanningWorkflow = createWorkflow({
  id: "activity-planning",
  description: "Plans activities based on weather conditions with conditional branching for indoor/outdoor recommendations",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeather)
  .branch([
    // Branch for high precipitation (indoor activities)
    [
      async ({ inputData }) => {
        return inputData?.precipitationChance > 50;
      },
      planIndoorActivities,
    ],
    // Branch for low precipitation (outdoor activities)
    [
      async ({ inputData }) => {
        return inputData?.precipitationChance <= 50;
      },
      planActivities,
    ],
  ])
  .commit();
