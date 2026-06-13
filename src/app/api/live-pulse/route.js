import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const OWM_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export async function POST(req) {
  try {
    const { city = 'Kolkata' } = await req.json();

    let realAqi = null;
    let lat = null;
    let lon = null;

    // 1. Fetch Geocoding data from OpenWeatherMap to get lat/lon
    if (OWM_API_KEY) {
      try {
        const geoRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_API_KEY}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = geoData[0].lat;
          lon = geoData[0].lon;

          // 2. Fetch Air Pollution data from OpenWeatherMap
          const aqiRes = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`);
          const aqiData = await aqiRes.json();
          
          if (aqiData && aqiData.list && aqiData.list.length > 0) {
            // AQI is 1, 2, 3, 4, 5. Let's convert it to a qualitative string to match the UX or just pass the number to Gemini.
            realAqi = aqiData.list[0].main.aqi; 
          }
        }
      } catch (err) {
        console.error("OpenWeatherMap fetch error:", err);
        // Continue and let Gemini mock it if fetching fails
      }
    }

    const aqiContext = realAqi 
      ? `The actual current Air Quality Index (AQI level from 1-5, where 1=Good, 5=Very Poor) for ${city} is ${realAqi}. Use this real AQI level as the basis for the air quality metric.`
      : `Generate a realistic Air Quality Index string (e.g. "Good", "Moderate", "Poor") for ${city}.`;

    // 3. Prompt Gemini to generate realistic environmental data
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const prompt = `You are a live environmental data system for the CarbonSense app.
Generate highly realistic, up-to-date environmental metrics and news for the city of "${city}".

${aqiContext}

Provide the response in the following strict JSON format, without markdown formatting or code blocks:

{
  "cityMetrics": {
    "airQuality": "AQI Level (e.g. 'Moderate (Level 3)' or 'Good (Level 1)')",
    "cityEmissions": "Realistic Daily CO2 estimate in metric tons (e.g. '12,500 MT')",
    "renewableEnergy": "Realistic percentage of renewable energy grid usage (e.g. '28%')",
    "publicTransport": "Realistic percentage of public transport usage today (e.g. '65%')"
  },
  "globalMeasures": [
    {
      "title": "A short, realistic recent headline about global carbon reduction (e.g. 'Paris Bans Cars in Center')",
      "location": "City or Country",
      "impact": "Estimated impact (e.g. '-500 Tons CO2')",
      "time": "e.g. '2 hours ago'"
    },
    // exactly 3 items
  ],
  "communityMissions": [
    {
      "title": "A realistic community mission for ${city} (e.g. '${city} Green Week')",
      "goalDesc": "Reduce 5000 kg CO2",
      "target": 5000,
      "progress": 3870,
      "participants": "e.g. '1,240 active'"
    },
    // exactly 2 items
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }

    const parsed = JSON.parse(jsonText.trim());

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (error) {
    console.error("Live Pulse API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch live pulse data" }), { status: 500 });
  }
}
