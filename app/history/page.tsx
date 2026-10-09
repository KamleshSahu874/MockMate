"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  Target,
  TrendingUp,
  Trophy,
  Trash2,
  XCircle,
} from "lucide-react";

type HistorySession = {
  id?: string;
  date?: string;
  createdAt?: string;
  timestamp?: string;
  role?: string;
  difficulty?: string;
  category?: string;
  mode?: "mcq" | "msq" | "interview" | string;
  totalQuestions?: number;
  answeredQuestions?: number;
  correctAnswers?: number;
  correctCount?: number;
  accuracy?: number;
  averageScore?: number;
};

const HISTORY_KEY = "mockmate_history";

function getSessionDate(session: HistorySession): string | undefined {
  return session.date || session.createdAt || session.timestamp;
}

function formatDate(dateValue?: string): string {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateValue?: string): string {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getAnsweredCount(session: HistorySession): number {
  return Number(
    session.answeredQuestions ?? session.totalQuestions ?? 0
  );
}

function getCorrectCount(session: HistorySession): number {
  return Number(
    session.correctAnswers ?? session.correctCount ?? 0
  );
}

function getAccuracy(session: HistorySession): number {
  if (typeof session.accuracy === "number") {
    return session.accuracy;
  }

  const answered = getAnsweredCount(session);
  const correct = getCorrectCount(session);

  return answered > 0
    ? Math.round((correct / answered) * 100)
    : 0;
}

function getModeLabel(mode?: string): string {
  switch (mode) {
    case "mcq":
      return "MCQ Practice";
    case "msq":
      return "MSQ Practice";
    case "interview":
      return "Technical Interview";
    default:
      return "Practice Session";
  }
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSessions(parsed as HistorySession[]);
        }
      }
    } catch (error) {
      console.error("Failed to load practice history:", error);
    } finally {
      setMounted(true);
    }
  }, []);

  const totalSessions = sessions.length;

  const totalQuestions = sessions.reduce(
    (total, session) => total + getAnsweredCount(session),
    0
  );

  const averageAccuracy =
    totalSessions > 0
      ? Math.round(
          sessions.reduce(
            (total, session) => total + getAccuracy(session),
            0
          ) / totalSessions
        )
      : 0;

  const averageScore =
    totalSessions > 0
      ? (
          sessions.reduce(
            (total, session) =>
              total + Number(session.averageScore ?? 0),
            0
          ) / totalSessions
        ).toFixed(1)
      : "0.0";

  function clearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all practice history?"
    );

    if (!confirmed) return;

    localStorage.removeItem(HISTORY_KEY);
    setSessions([]);
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#080810] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-gray-400">
            Loading practice history...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080810] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/interview"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Practice
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
            <History size={18} />
            MockMate History
          </div>
        </header>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
            <Trophy size={17} />
            YOUR PROGRESS
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Practice History
            <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Track your improvement.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Review completed sessions, correct answers, scores,
            and when you practiced.
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Sessions"
            value={totalSessions}
            description="Saved practice sessions"
            icon={<History size={20} />}
            color="text-violet-300"
          />

          <StatCard
            title="Questions"
            value={totalQuestions}
            description="Questions answered"
            icon={<CheckCircle2 size={20} />}
            color="text-emerald-400"
          />

          <StatCard
            title="Average accuracy"
            value={`${averageAccuracy}%`}
            description="Average across sessions"
            icon={<TrendingUp size={20} />}
            color="text-fuchsia-300"
          />

          <StatCard
            title="Average score"
            value={`${averageScore}/10`}
            description="Average session score"
            icon={<Trophy size={20} />}
            color="text-amber-300"
          />
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            Previous sessions
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {totalSessions} saved
            </span>

            {sessions.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 size={15} />
                Clear history
              </button>
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <BookOpen size={27} />
            </div>

            <h3 className="text-lg font-semibold">
              No practice sessions yet
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Complete a practice session to see your results here.
            </p>

            <Link
              href="/interview"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-semibold transition hover:opacity-90"
            >
              Start Practicing
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            {sessions.map((session, index) => {
              const sessionDate = getSessionDate(session);
              const answered = getAnsweredCount(session);
              const correct = getCorrectCount(session);
              const accuracy = getAccuracy(session);

              return (
                <article
                  key={session.id || `${sessionDate}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-500/30 sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                          {getModeLabel(session.mode)}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                          {session.difficulty || "Not specified"}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold sm:text-xl">
                        {session.role || "Practice Session"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
                        Topic: {session.category || "General"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          {formatDate(sessionDate)}
                        </span>

                        {formatTime(sessionDate) && (
                          <span className="flex items-center gap-2">
                            <Clock size={15} />
                            {formatTime(sessionDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                        <p className="text-xs text-gray-400">
                          Accuracy
                        </p>

                        <p className="mt-2 text-2xl font-bold text-emerald-400">
                          {accuracy}%
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                        <p className="text-xs text-gray-400">
                          Avg. score
                        </p>

                        <p className="mt-2 text-2xl font-bold text-violet-300">
                          {Number(
                            session.averageScore ?? 0
                          ).toFixed(1)}
                          <span className="text-sm text-gray-500">
                            /10
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-5 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />
                      {correct} of {answered} correct answers
                    </span>

                    <span className="flex items-center gap-2">
                      <Target size={16} className="text-gray-500" />
                      {answered} questions answered
                    </span>

                    {typeof session.totalQuestions === "number" &&
                      session.totalQuestions > answered && (
                        <span className="flex items-center gap-2">
                          <XCircle
                            size={16}
                            className="text-gray-500"
                          />
                          {session.totalQuestions - answered} unanswered
                        </span>
                      )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{title}</p>
        <span className={color}>{icon}</span>
      </div>

      <p className="mt-5 text-3xl font-bold">{value}</p>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}