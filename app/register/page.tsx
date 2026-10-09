"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/interview`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.replace("/interview");
        router.refresh();
      } else {
        setMessage(
          "Account created! Check your email and click the confirmation link before logging in."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080d] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
        <Link href="/" className="text-sm text-violet-300 hover:text-violet-200">
          ← Back to MockMate
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-gray-400">
          Start preparing for interviews with MockMate.
        </p>

        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <label className="block text-sm text-gray-300">
            Full name
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3">
              <UserRound size={18} className="text-gray-500" />
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent py-3 outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent py-3 outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-green-500/10 p-3 text-sm text-green-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}