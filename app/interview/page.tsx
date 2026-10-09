"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  History,
  BookOpen,
} from "lucide-react";

type Mode = "mcq" | "msq" | "interview";

type Question = {
  question: string;
  options?: string[];
  correctAnswer?: number | number[];
  correctAnswers?: number[];
  hint?: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
};

type Evaluation = {
  score?: number;
  feedback?: string;
  strengths?: string | string[];
  improvements?: string | string[];
  idealAnswer?: string;
  modelAnswer?: string;
};

type HistorySession = {
  id: string;
  date: string;
  role: string;
  difficulty: string;
  category: string;
  mode: Mode;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
};

const HISTORY_KEY = "mockmate_history";
const MAX_QUESTIONS = 50;

const ROLE_TOPICS: Record<string, string[]> = {
  "Software Developer": [
    "JavaScript",
    "Java",
    "Python",
    "Data Structures and Algorithms",
    "Object-Oriented Programming",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "System Design",
  ],
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Next.js",
    "TypeScript",
    "Web Performance",
    "Accessibility",
  ],
  "Backend Developer": [
    "Java",
    "Spring Boot",
    "Node.js",
    "REST APIs",
    "Databases",
    "Authentication",
    "System Design",
    "Microservices",
  ],
  "Full Stack Developer": [
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "MongoDB",
    "SQL",
    "REST APIs",
    "Authentication",
  ],
  "Java Developer": [
    "Core Java",
    "OOP",
    "Collections Framework",
    "Exception Handling",
    "Multithreading",
    "JDBC",
    "Spring Boot",
    "SQL",
  ],
  "Python Developer": [
    "Python",
    "OOP",
    "Data Structures",
    "Django",
    "Flask",
    "REST APIs",
    "SQL",
    "Problem Solving",
  ],
  "Data Analyst": [
    "SQL",
    "Python",
    "Excel",
    "Statistics",
    "Power BI",
    "Data Visualization",
    "Data Cleaning",
    "Machine Learning Basics",
  ],
  "Data Scientist": [
    "Python",
    "Statistics",
    "Probability",
    "Machine Learning",
    "Deep Learning",
    "SQL",
    "Data Visualization",
    "Feature Engineering",
  ],
  "Machine Learning Engineer": [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "Neural Networks",
    "NLP",
    "Computer Vision",
    "Model Evaluation",
    "MLOps",
  ],
  "DevOps Engineer": [
    "Linux",
    "Git",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "AWS",
    "Networking",
    "Monitoring",
  ],
  "Cybersecurity Analyst": [
    "Network Security",
    "Cryptography",
    "Ethical Hacking",
    "Web Security",
    "Linux",
    "Incident Response",
    "Security Fundamentals",
  ],
  "QA Engineer": [
    "Manual Testing",
    "Automation Testing",
    "Selenium",
    "API Testing",
    "Test Cases",
    "SQL",
    "Software Testing Fundamentals",
  ],
  "Cloud Engineer": [
    "AWS",
    "Azure",
    "Cloud Fundamentals",
    "Networking",
    "Linux",
    "Docker",
    "Security",
    "Cloud Architecture",
  ],
  "Mobile App Developer": [
    "Android",
    "Kotlin",
    "Java",
    "React Native",
    "Flutter",
    "Mobile UI",
    "APIs",
  ],
  "HR / Sales Associate": [
    "Communication Skills",
    "Customer Handling",
    "Sales Fundamentals",
    "Negotiation",
    "Teamwork",
    "Behavioral Questions",
    "Problem Solving",
  ],
};

const ROLES = Object.keys(ROLE_TOPICS);

const normalizeQuestion = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const getErrorMessage = (data: Record<string, unknown>) =>
  typeof data.error === "string"
    ? data.error
    : "Something went wrong. Please try again.";

export default function InterviewPage() {
  const [mode, setMode] = useState<Mode>("mcq");
  const [role, setRole] = useState("Software Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [category, setCategory] = useState("JavaScript");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionInput, setQuestionInput] = useState("10");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);

  const availableTopics = ROLE_TOPICS[role] ?? ["General"];

  function changeRole(newRole: string) {
    setRole(newRole);
    setCategory(ROLE_TOPICS[newRole]?.[0] ?? "General");
  }

  function changeQuestionCount(value: string) {
    setQuestionInput(value);

    if (value.trim() === "") return;

    const parsed = Number(value);

    if (
      Number.isInteger(parsed) &&
      parsed >= 1 &&
      parsed <= MAX_QUESTIONS
    ) {
      setTotalQuestions(parsed);
    }
  }

  async function requestQuestion(
    number: number,
    previous: string[],
  ): Promise<Question> {
    const previousNormalized = new Set(
      previous.map(normalizeQuestion),
    );

    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          role,
          difficulty,
          category,
          questionNumber: number,
          previousQuestions: previous,
        }),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (
        typeof data.question !== "string" ||
        !data.question.trim()
      ) {
        throw new Error("The AI returned an invalid question.");
      }

      const generated = data.question.trim();

      if (!previousNormalized.has(normalizeQuestion(generated))) {
        const result = data as unknown as Question;

        if (
          mode === "mcq" &&
          typeof result.correctAnswer !== "number"
        ) {
          throw new Error(
            "The MCQ API response is missing its correct answer.",
          );
        }

        if (
          mode === "msq" &&
          !Array.isArray(result.correctAnswer) &&
          !Array.isArray(result.correctAnswers)
        ) {
          throw new Error(
            "The MSQ API response is missing its correct answers.",
          );
        }

        if (
          (mode === "mcq" || mode === "msq") &&
          (!Array.isArray(result.options) ||
            result.options.length !== 4)
        ) {
          throw new Error(
            "The API did not return four answer options.",
          );
        }

        return result;
      }

      previousNormalized.add(normalizeQuestion(generated));
      previous = [...previous, generated];
    }

    throw new Error(
      "Repeated questions were generated. Please try again.",
    );
  }

  async function loadQuestion(number: number, previous: string[]) {
    setLoadingQuestion(true);
    setError("");
    setQuestion(null);
    setEvaluation(null);
    setSelectedOptions([]);
    setAnswer("");
    setShowHint(false);
    setShowResult(false);

    try {
      const newQuestion = await requestQuestion(number, previous);

      setQuestion(newQuestion);
      setQuestionNumber(number);
      setAskedQuestions((current) => [
        ...current,
        newQuestion.question,
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate a question.",
      );
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function startPractice() {
    const count = Number(questionInput);

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > MAX_QUESTIONS
    ) {
      setError(
        `Enter a whole number between 1 and ${MAX_QUESTIONS}.`,
      );
      return;
    }

    setTotalQuestions(count);
    setStarted(true);
    setFinished(false);
    setSaved(false);
    setCorrectCount(0);
    setScores([]);
    setAskedQuestions([]);
    setQuestionNumber(1);

    await loadQuestion(1, []);
  }

  function toggleOption(index: number) {
    if (showResult) return;

    if (mode === "mcq") {
      setSelectedOptions([index]);
    } else {
      setSelectedOptions((current) =>
        current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index],
      );
    }
  }

  function getCorrectIndexes(): number[] {
    if (
      mode === "mcq" &&
      typeof question?.correctAnswer === "number"
    ) {
      return [question.correctAnswer];
    }

    if (Array.isArray(question?.correctAnswer)) {
      return question.correctAnswer;
    }

    return question?.correctAnswers ?? [];
  }

  async function submitAnswer() {
    if (!question || showResult) return;

    if (
      (mode === "mcq" || mode === "msq") &&
      selectedOptions.length === 0
    ) {
      setError("Please select your answer first.");
      return;
    }

    if (mode === "interview" && !answer.trim()) {
      setError("Please write your answer first.");
      return;
    }

    setError("");

    if (mode === "mcq" || mode === "msq") {
      const expected = [...getCorrectIndexes()].sort(
        (a, b) => a - b,
      );
      const selected = [...selectedOptions].sort(
        (a, b) => a - b,
      );

      const isCorrect =
        expected.length > 0 &&
        expected.length === selected.length &&
        expected.every(
          (value, index) => value === selected[index],
        );

      setShowResult(true);

      if (isCorrect) {
        setCorrectCount((count) => count + 1);
      }

      setScores((current) => [
        ...current,
        isCorrect ? 10 : 0,
      ]);
      return;
    }

    setEvaluating(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          answer,
          role,
          difficulty,
          category,
        }),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      const result = data as Evaluation;

      setEvaluation(result);
      setShowResult(true);

      const score =
        typeof result.score === "number"
          ? Math.max(0, Math.min(10, result.score))
          : 0;

      setScores((current) => [...current, score]);

      if (score >= 5) {
        setCorrectCount((count) => count + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to evaluate your answer.",
      );
    } finally {
      setEvaluating(false);
    }
  }

  function finishPractice() {
    if (!saved) {
      const average =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) /
            scores.length
          : 0;

      const session: HistorySession = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        date: new Date().toISOString(),
        role,
        difficulty,
        category,
        mode,
        totalQuestions,
        answeredQuestions: scores.length,
        correctAnswers: correctCount,
        accuracy:
          scores.length > 0
            ? Math.round(
                (correctCount / scores.length) * 100,
              )
            : 0,
        averageScore: Number(average.toFixed(1)),
      };

      try {
        const existing: HistorySession[] = JSON.parse(
          localStorage.getItem(HISTORY_KEY) || "[]",
        );

        localStorage.setItem(
          HISTORY_KEY,
          JSON.stringify([session, ...existing]),
        );

        setSaved(true);
      } catch (err) {
        console.error(
          "Unable to save practice history:",
          err,
        );
        setError("Could not save your practice history.");
      }
    }

    setFinished(true);
  }

  async function nextQuestion() {
    if (questionNumber >= totalQuestions) {
      finishPractice();
      return;
    }

    await loadQuestion(questionNumber + 1, askedQuestions);
  }

  function restartPractice() {
    setStarted(false);
    setFinished(false);
    setQuestion(null);
    setAskedQuestions([]);
    setQuestionNumber(1);
    setSelectedOptions([]);
    setAnswer("");
    setShowHint(false);
    setShowResult(false);
    setEvaluation(null);
    setError("");
    setCorrectCount(0);
    setScores([]);
    setSaved(false);
  }

  function renderFeedback(value: unknown) {
    if (typeof value === "string") {
      return (
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {value}
        </p>
      );
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc space-y-1 pl-5">
          {value.map((item, index) => (
            <li
              key={index}
              className="break-words [overflow-wrap:anywhere]"
            >
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }

    return null;
  }

  const answeredCount = scores.length;

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(1)
      : "0.0";

  const accuracy =
    answeredCount > 0
      ? Math.round((correctCount / answeredCount) * 100)
      : 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080810] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} className="shrink-0" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/history"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 hover:bg-white/[0.08] sm:px-4"
          >
            <History size={17} />
            <span>Practice History</span>
          </Link>
        </header>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
            <Sparkles size={17} />
            MOCKMATE AI PRACTICE
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Prepare smarter.
            <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Perform better.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Practice questions tailored to your role, topic, and
            difficulty. Previous questions are sent to the AI to
            help reduce repetition.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex min-w-0 items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-300">
            <XCircle
              className="mt-0.5 shrink-0"
              size={18}
            />
            <p className="min-w-0 break-words [overflow-wrap:anywhere]">
              {error}
            </p>
          </div>
        )}

        {!started && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <h2 className="mb-6 text-xl font-semibold">
              Configure your practice
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-2 block text-sm text-gray-300">
                  Practice Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) =>
                    setMode(e.target.value as Mode)
                  }
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 outline-none focus:border-violet-500"
                >
                  <option value="mcq">
                    Multiple Choice (MCQ)
                  </option>
                  <option value="msq">
                    Multiple Select (MSQ)
                  </option>
                  <option value="interview">
                    Technical Interview
                  </option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm text-gray-300">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => changeRole(e.target.value)}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 outline-none focus:border-violet-500"
                >
                  {ROLES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm text-gray-300">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 outline-none focus:border-violet-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm text-gray-300">
                  Topic / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 outline-none focus:border-violet-500"
                >
                  {availableTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="questionCount"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Number of Questions (1–{MAX_QUESTIONS})
                </label>

                <input
                  id="questionCount"
                  type="number"
                  min={1}
                  max={MAX_QUESTIONS}
                  step={1}
                  value={questionInput}
                  onChange={(e) =>
                    changeQuestionCount(e.target.value)
                  }
                  onBlur={() => {
                    const count = Number(questionInput);

                    if (
                      questionInput.trim() === "" ||
                      !Number.isInteger(count) ||
                      count < 1 ||
                      count > MAX_QUESTIONS
                    ) {
                      setQuestionInput(
                        String(totalQuestions),
                      );
                    }
                  }}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 outline-none focus:border-violet-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Type the number of questions you want to
                  practice.
                </p>
              </div>
            </div>

            <button
              onClick={startPractice}
              disabled={!role || !category || loadingQuestion}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              {loadingQuestion ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={19}
                  />
                  Generating Question...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Start Practice
                </>
              )}
            </button>
          </section>
        )}

        {started && loadingQuestion && (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <Loader2
              size={36}
              className="mb-4 animate-spin text-violet-400"
            />
            <h2 className="text-lg font-semibold">
              Generating your next question
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Preparing a question for your selected topic...
            </p>
          </section>
        )}

        {started &&
          !finished &&
          question &&
          !loadingQuestion && (
            <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                  <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300">
                    {category}
                  </span>
                  <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300">
                    {difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={16} />
                  {mode === "interview"
                    ? "Written Answer"
                    : mode.toUpperCase()}
                </div>
              </div>

              <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{
                    width: `${(questionNumber / totalQuestions) * 100}%`,
                  }}
                />
              </div>

              <h2 className="mb-6 break-words text-xl font-semibold leading-relaxed [overflow-wrap:anywhere] sm:text-2xl">
                {question.question}
              </h2>

              {(mode === "mcq" || mode === "msq") &&
                question.options && (
                  <div className="min-w-0 space-y-3">
                    {question.options.map((option, index) => {
                      const selected =
                        selectedOptions.includes(index);
                      const correct =
                        getCorrectIndexes().includes(index);

                      let style =
                        "border-white/10 bg-white/[0.02] hover:border-violet-500/50 hover:bg-violet-500/[0.06]";

                      if (selected) {
                        style =
                          "border-violet-500 bg-violet-500/10";
                      }

                      if (showResult && correct) {
                        style =
                          "border-emerald-500/50 bg-emerald-500/10";
                      } else if (
                        showResult &&
                        selected &&
                        !correct
                      ) {
                        style =
                          "border-red-500/50 bg-red-500/10";
                      }

                      return (
                        <button
                          key={`${index}-${option}`}
                          onClick={() => toggleOption(index)}
                          disabled={showResult}
                          className={`flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-default sm:gap-4 sm:p-4 ${style}`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>

                          <span className="min-w-0 flex-1 break-words pt-1 text-sm leading-6 text-gray-200 [overflow-wrap:anywhere]">
                            {option}
                          </span>

                          {showResult && correct && (
                            <CheckCircle2
                              size={19}
                              className="mt-1 shrink-0 text-emerald-400"
                            />
                          )}

                          {showResult &&
                            selected &&
                            !correct && (
                              <XCircle
                                size={19}
                                className="mt-1 shrink-0 text-red-400"
                              />
                            )}
                        </button>
                      );
                    })}
                  </div>
                )}

              {mode === "interview" && (
                <div className="min-w-0">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={showResult}
                    rows={7}
                    placeholder="Write your answer here..."
                    className="w-full min-w-0 resize-y rounded-xl border border-white/10 bg-[#11111d] p-4 text-sm leading-6 outline-none placeholder:text-gray-600 focus:border-violet-500 disabled:opacity-80"
                  />

                  {question.hint && !showResult && (
                    <button
                      onClick={() =>
                        setShowHint((value) => !value)
                      }
                      aria-expanded={showHint}
                      className="mt-3 flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200"
                    >
                      <CircleHelp size={17} />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </button>
                  )}

                  {showHint && question.hint && (
                    <div className="mt-3 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3 text-sm leading-6 text-gray-300 sm:p-4">
                      <div className="mb-2 flex items-center gap-2 font-medium text-violet-300">
                        <CircleHelp
                          size={16}
                          className="shrink-0"
                        />
                        <span>Hint</span>
                      </div>

                      <p className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {question.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {showResult && mode !== "interview" && (
                <div className="mt-6 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                  {(() => {
                    const expected = [
                      ...getCorrectIndexes(),
                    ].sort((a, b) => a - b);

                    const selected = [
                      ...selectedOptions,
                    ].sort((a, b) => a - b);

                    const correct =
                      expected.length > 0 &&
                      expected.length === selected.length &&
                      expected.every(
                        (value, index) =>
                          value === selected[index],
                      );

                    return (
                      <div
                        className={`mb-3 flex items-center gap-2 font-semibold ${
                          correct
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {correct ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                        {correct
                          ? "Correct Answer!"
                          : "Incorrect Answer"}
                      </div>
                    );
                  })()}

                  {question.explanation && (
                    <p className="break-words text-sm leading-6 text-gray-300 [overflow-wrap:anywhere]">
                      <strong className="text-white">
                        Explanation:{" "}
                      </strong>
                      {question.explanation}
                    </p>
                  )}
                </div>
              )}

              {showResult &&
                mode === "interview" &&
                evaluation && (
                  <div className="mt-6 min-w-0 space-y-4">
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-4 sm:p-5">
                      <p className="text-sm text-gray-400">
                        Your Score
                      </p>

                      <p className="mt-1 text-3xl font-bold text-violet-300">
                        {typeof evaluation.score === "number"
                          ? `${evaluation.score}/10`
                          : "Evaluated"}
                      </p>

                      {evaluation.feedback && (
                        <div className="mt-4 break-words text-sm leading-6 text-gray-300 [overflow-wrap:anywhere]">
                          {renderFeedback(evaluation.feedback)}
                        </div>
                      )}
                    </div>

                    {evaluation.strengths && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 sm:p-5">
                        <h3 className="mb-3 font-semibold text-emerald-300">
                          Strengths
                        </h3>

                        <div className="break-words text-sm leading-6 text-gray-300 [overflow-wrap:anywhere]">
                          {renderFeedback(
                            evaluation.strengths,
                          )}
                        </div>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 sm:p-5">
                        <h3 className="mb-3 font-semibold text-amber-300">
                          Areas to Improve
                        </h3>

                        <div className="break-words text-sm leading-6 text-gray-300 [overflow-wrap:anywhere]">
                          {renderFeedback(
                            evaluation.improvements,
                          )}
                        </div>
                      </div>
                    )}

                    {(evaluation.idealAnswer ||
                      evaluation.modelAnswer) && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                        <h3 className="mb-3 font-semibold">
                          Suggested Answer
                        </h3>

                        <div className="break-words text-sm leading-6 text-gray-300 [overflow-wrap:anywhere]">
                          {renderFeedback(
                            evaluation.idealAnswer ??
                              evaluation.modelAnswer,
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  onClick={() =>
                    setShowHint((value) => !value)
                  }
                  disabled={showResult || !question.hint}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/[0.05] disabled:opacity-40"
                >
                  <BookOpen size={17} />
                  {showHint ? "Hide Hint" : "Need a Hint?"}
                </button>

                {!showResult ? (
                  <button
                    onClick={submitAnswer}
                    disabled={evaluating}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    disabled={loadingQuestion}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {questionNumber >= totalQuestions
                      ? "Finish Practice"
                      : "Next Question"}
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                Questions completed: {answeredCount} /{" "}
                {totalQuestions}
              </p>
            </section>
          )}

        {started &&
          !finished &&
          !question &&
          !loadingQuestion &&
          error && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() =>
                  loadQuestion(questionNumber, askedQuestions)
                }
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500"
              >
                <RotateCcw size={17} />
                Retry Question
              </button>
            </div>
          )}

        {finished && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <Trophy size={32} />
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Practice Completed!
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Great work! Here is your performance summary.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-gray-400">
                  Answered
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {answeredCount}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-gray-400">
                  Accuracy
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {accuracy}%
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-gray-400">
                  Average Score
                </p>
                <p className="mt-2 text-3xl font-bold text-violet-300">
                  {averageScore}/10
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={restartPractice}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold hover:opacity-90"
              >
                <RotateCcw size={18} />
                Practice Again
              </button>

              <Link
                href="/history"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-medium text-gray-300 hover:bg-white/[0.05]"
              >
                <History size={18} />
                View History
              </Link>
            </div>

            {saved && (
              <p className="mt-5 text-sm text-emerald-400">
                <CheckCircle2
                  size={16}
                  className="mr-1 inline"
                />
                Your practice session has been saved.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}