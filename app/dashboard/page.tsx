"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  History,
  LogOut,
  Loader2,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkUser();
  }, [router, supabase]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080d] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrainCircuit className="text-violet-400" size={28} />
            MockMate
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-gray-400 sm:flex">
              <UserRound size={16} />
              {email}
            </span>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Your interview workspace
          </p>

          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
            Welcome back{email ? `, ${email.split("@")[0]}` : ""}!
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Practice interviews, improve your answers, and track your progress
            with MockMate.
          </p>
        </section>

        {error && (
          <p role="alert" className="mb-5 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/interview"
            className="group rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] p-6 transition hover:border-violet-400/50 hover:bg-violet-500/[0.12]"
          >
            <PlayCircle size={30} className="text-violet-400" />
            <h2 className="mt-5 text-xl font-semibold">Start Practicing</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Start a new mock interview and test your skills.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-violet-300">
              Start interview →
            </span>
          </Link>

          <Link
            href="/history"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-500/40"
          >
            <History size={30} className="text-violet-400" />
            <h2 className="mt-5 text-xl font-semibold">Practice History</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Review your previous practice sessions and scores.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-violet-300">
              View history →
            </span>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <BrainCircuit size={30} className="text-violet-400" />
            <h2 className="mt-5 text-xl font-semibold">Keep Improving</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Practice consistently and build confidence for your next
              interview.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}