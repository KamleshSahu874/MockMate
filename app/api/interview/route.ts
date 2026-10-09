import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing. Check your .env.local file.",
        },
        { status: 500 }
      );
    }

    const { role, difficulty, category } = await request.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert technical interviewer for an application called MockMate.

Generate ONE realistic technical interview question.

Candidate Role: ${role}
Difficulty: ${difficulty}
Category: ${category}

Rules:
- Ask exactly one question.
- The question must be relevant to the role.
- Match the requested difficulty.
- Do not provide the answer.
- Give a short hint.
- Keep the question concise.

Return ONLY valid JSON:

{
  "question": "The interview question",
  "hint": "A short hint without revealing the answer",
  "category": "${category}",
  "difficulty": "${difficulty}"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("===================================");

    const message =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}