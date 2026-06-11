import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Call Gemini Vision to extract food items
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const prompt = `
      Analyze this food delivery receipt/screenshot.
      Extract the food items ordered.
      For each item, estimate the carbon footprint in kg CO2e broken down by:
      - packaging (estimated based on typical food packaging)
      - delivery (assume a standard 5km delivery)
      - food (based on typical emissions for that type of food e.g., beef is high, veggies are low)
      
      Return ONLY a JSON response in the exact format below, with no markdown, no \`\`\`json wrappers, just the raw JSON text:
      {
        "items": [
          { "name": "Item Name", "packaging": "0.5 kg", "delivery": "1.2 kg", "food": "1.8 kg", "total": "3.5 kg" }
        ],
        "total": "Sum of all totals kg CO₂"
      }
    `;

    const imageParts = [
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: file.type
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up potential markdown JSON wrappers if the model ignores the prompt instruction
    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    
    const parsedData = JSON.parse(jsonText.trim());

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in OCR API:', error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}
