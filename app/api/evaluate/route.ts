import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const {
      question,
      answer,
      role,
      difficulty,
      category,
    } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        {
          error: "Question and answer are required.",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert technical interviewer for an application called MockMate.

Evaluate the candidate's answer to the interview question.

Candidate Role: ${role}
Difficulty: ${difficulty}
Category: ${category}

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer based on:
1. Technical correctness
2. Understanding of the concept
3. Completeness
4. Clarity

Give a fair score from 0 to 10.

Return ONLY valid JSON in exactly this format:

{
  "score": 8,
  "correctness": "Short explanation of whether the answer is technically correct.",
  "strengths": [
    "First strength",
    "Second strength"
  ],
  "weaknesses": [
    "First weakness",
    "Second weakness"
  ],
  "improvements": [
    "First improvement suggestion",
    "Second improvement suggestion"
  ],
  "idealAnswer": "A concise example of what a strong interview answer could look like."
}

Important:
- Do not give a score higher than 10.
- Do not give a score lower than 0.
- Be constructive.
- Do not penalize minor wording or grammar mistakes.
- Focus primarily on technical understanding.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.3,
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
    console.error("========== EVALUATION ERROR ==========");
    console.error(error);
    console.error("======================================");

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}