import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { appliances } = body;

    if (!appliances || !appliances.trim()) {
      return new Response(JSON.stringify({ error: "No appliances provided" }), { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const prompt = `You are a home energy and carbon footprint analyst.

The user described their home appliances: "${appliances}"

For each appliance they mentioned, provide:
- The appliance name
- An appropriate emoji
- Estimated yearly carbon footprint in kg CO2
- An energy efficiency rating from A (best) to G (worst)
- The severity level: "low" (under 100 kg/yr), "medium" (100-500 kg/yr), or "high" (over 500 kg/yr)
- A short, actionable tip to reduce that appliance's carbon footprint

Also calculate the total yearly household carbon footprint from all appliances combined.

Return ONLY raw JSON with no markdown wrappers, no \`\`\`json blocks:
{
  "totalFootprint": "1200 kg CO₂/year",
  "appliances": [
    {
      "name": "Appliance Name",
      "emoji": "❄️",
      "yearlyCO2": 450,
      "rating": "D",
      "severity": "medium",
      "tip": "Your actionable tip here"
    }
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

    if (!parsed.appliances || !Array.isArray(parsed.appliances)) {
      throw new Error("Invalid format from AI");
    }

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (error) {
    console.error("Home Energy Analyze Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze appliances" }), { status: 500 });
  }
}
