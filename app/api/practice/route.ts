import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

type PracticeRequest = {
  mode?: string;
  role?: string;
  difficulty?: string;
  category?: string;
  questionNumber?: number;
  previousQuestions?: string[];
};

type GeneratedQuestion = {
  question?: string;
  options?: string[];
  correctAnswer?: number | number[];
  correctAnswers?: number[];
  explanation?: string;
  hint?: string;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function isDuplicate(
  question: string,
  previousQuestions: string[],
): boolean {
  const current = normalize(question);

  return previousQuestions.some((previous) => {
    const old = normalize(previous);

    if (!current || !old) return false;
    if (current === old) return true;

    // Detect substantial wording overlap.
    if (
      current.length > 30 &&
      old.length > 30 &&
      (current.includes(old) || old.includes(current))
    ) {
      return true;
    }

    return false;
  });
}

function validOptions(options: unknown): options is string[] {
  if (
    !Array.isArray(options) ||
    options.length !== 4 ||
    !options.every(
      (option) =>
        typeof option === "string" && option.trim().length > 0,
    )
  ) {
    return false;
  }

  return new Set(options.map((option) => normalize(option))).size === 4;
}

function validIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 3
  );
}

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as PracticeRequest;

    const {
      mode,
      role,
      difficulty,
      category,
      questionNumber = 1,
      previousQuestions = [],
    } = body;

    if (!mode || !role?.trim() || !difficulty || !category?.trim()) {
      return NextResponse.json(
        { error: "Mode, role, difficulty, and category are required." },
        { status: 400 },
      );
    }

    const normalizedMode = mode.toLowerCase();

    if (!["mcq", "msq", "interview"].includes(normalizedMode)) {
      return NextResponse.json(
        { error: "Invalid practice mode." },
        { status: 400 },
      );
    }

    const history = Array.isArray(previousQuestions)
      ? previousQuestions
          .filter((item): item is string => typeof item === "string")
          .slice(-50)
      : [];

    const isMCQ = normalizedMode === "mcq";
    const isMSQ = normalizedMode === "msq";
    const isChoiceMode = isMCQ || isMSQ;

    const answerInstructions = isMCQ
      ? `
Return exactly this JSON structure:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explain why the correct option is correct."
}

MCQ requirements:
- Provide exactly four distinct, meaningful options.
- Exactly one option must be correct.
- correctAnswer must be one integer: 0, 1, 2, or 3.
- The correct index must match the actual correct option.
- Do not include the answer in the question text.
`
      : isMSQ
        ? `
Return exactly this JSON structure:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": [0, 2],
  "explanation": "Explain why the selected options are correct."
}

MSQ requirements:
- Provide exactly four distinct, meaningful options.
- At least two options must be correct.
- correctAnswers must be an array of unique integer indexes from 0 to 3.
- Include every correct option and no incorrect options.
`
        : `
Return this JSON structure:
{
  "question": "Interview question text",
  "hint": "A helpful hint that does not reveal the complete answer",
  "explanation": "Optional guidance about a strong answer"
}

Interview requirements:
- Do not include options or answer indexes.
- Generate a question appropriate for the selected role and topic.
- Include a useful hint.
`;

    const prompt = `
You are a professional technical interviewer and assessment designer.

Generate exactly ONE original question.

PRACTICE SETTINGS
Role: ${role}
Difficulty: ${difficulty}
Topic: ${category}
Mode: ${normalizedMode}
Question number: ${questionNumber}

QUESTIONS ALREADY ASKED IN THIS SESSION
${
  history.length > 0
    ? history.map((q, index) => `${index + 1}. ${q}`).join("\n")
    : "No previous questions."
}

STRICT REQUIREMENTS
1. Do not repeat any question listed above.
2. Avoid testing the same underlying concept as a previous question.
3. Choose a different concept, scenario, or problem-solving approach.
4. Match the selected role, difficulty, and topic.
5. Ensure the question has one clear interpretation.
6. For programming questions, ensure the answer is technically correct.
7. Return valid JSON only. Do not use Markdown fences.
8. Follow the requested response schema exactly.

${answerInstructions}
`;

    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents:
          prompt +
          (attempt > 0
            ? `

RETRY ${attempt}:
Your previous output was invalid or too similar to an earlier question.
Generate a substantially different question and validate every answer index.
Return only valid JSON.`
            : ""),
        config: {
          temperature: Math.min(0.7 + attempt * 0.1, 1),
          responseMimeType: "application/json",
        },
      });

      let result: GeneratedQuestion;

      try {
        result = JSON.parse(response.text ?? "{}");
      } catch {
        continue;
      }

      if (
        typeof result.question !== "string" ||
        !result.question.trim()
      ) {
        continue;
      }

      const question = result.question.trim();

      if (isDuplicate(question, history)) {
        continue;
      }

      if (!isChoiceMode) {
        return NextResponse.json({
          question,
          hint:
            typeof result.hint === "string" ? result.hint : "",
          explanation:
            typeof result.explanation === "string"
              ? result.explanation
              : "",
        });
      }

      if (!validOptions(result.options)) {
        continue;
      }

      const options = result.options.map((option) => option.trim());

      if (isMCQ) {
        if (!validIndex(result.correctAnswer)) {
          continue;
        }

        return NextResponse.json({
          question,
          options,
          correctAnswer: result.correctAnswer,
          explanation:
            typeof result.explanation === "string"
              ? result.explanation
              : "",
        });
      }

      // Accept the correctAnswers property used by the frontend.
      const rawAnswers =
        result.correctAnswers ??
        (Array.isArray(result.correctAnswer)
          ? result.correctAnswer
          : []);

      if (
        !Array.isArray(rawAnswers) ||
        rawAnswers.length < 2 ||
        !rawAnswers.every(validIndex) ||
        new Set(rawAnswers).size !== rawAnswers.length
      ) {
        continue;
      }

      return NextResponse.json({
        question,
        options,
        correctAnswers: rawAnswers,
        explanation:
          typeof result.explanation === "string"
            ? result.explanation
            : "",
      });
    }

    return NextResponse.json(
      {
        error:
          "Could not generate a valid new question after several attempts. Please retry.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Practice question generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate a practice question." },
      { status: 500 },
    );
  }
}