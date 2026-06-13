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
    const { activities } = body;

    if (!activities || !activities.trim()) {
      return new Response(JSON.stringify({ error: "No activities provided" }), { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const prompt = `You are a carbon emissions awareness quiz generator.

The user described their day: "${activities}"

Based on the SPECIFIC activities they mentioned, generate exactly 4 carbon awareness quiz questions. Each question should:
- Directly relate to one of the activities they described
- Teach about greener alternatives or carbon impact
- Have exactly 3 answer options (A, B, C)
- Have exactly one correct answer

Return ONLY raw JSON with no markdown wrappers, no \`\`\`json blocks, just the raw JSON object:
{
  "questions": [
    {
      "question": "Your question text here?",
      "options": ["A. Option one", "B. Option two", "C. Option three"],
      "correctIndex": 0,
      "xp": 20,
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up potential markdown JSON wrappers
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

    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("Invalid question format from AI");
    }

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (error) {
    console.error("Challenge Generate Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate challenges" }), { status: 500 });
  }
}
