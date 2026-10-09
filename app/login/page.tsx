"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080d] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
        <Link
          href="/"
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          ← Back to MockMate
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>

        <p className="mt-2 text-sm text-gray-400">
          Login to continue your interview preparation.
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <label className="block text-sm text-gray-300">
            Email address
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3">
              <Mail size={18} className="text-gray-500" />
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent py-3 outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          <label className="block text-sm text-gray-300">
            Password
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3">
              <LockKeyhole size={18} className="text-gray-500" />
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-transparent py-3 outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-violet-300 hover:text-violet-200"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}