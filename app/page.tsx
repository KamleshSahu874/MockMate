"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Target,
  MessageSquare,
  TrendingUp,
  Loader2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setChecking(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session?.user) {
        router.replace("/login");
      } else {
        setEmail(session.user.email ?? "");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      alert(error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={32}
            className="animate-spin text-fuchsia-400"
          />
          <p className="text-sm text-gray-400">
            Opening MockMate...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08080d] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080d]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <BrainCircuit size={23} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Mock<span className="text-fuchsia-400">Mate</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#roles" className="transition hover:text-white">
              Roles
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#about" className="transition hover:text-white">
              About
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span className="max-w-40 truncate text-xs text-gray-400">
              {email}
            </span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-white disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
            <Link
              href="/interview"
              className="flex items-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-semibold transition hover:bg-fuchsia-500"
            >
              Get Started <ArrowRight size={17} />
            </Link>
          </div>

          <button
            className="rounded-lg border border-white/10 p-2 md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="space-y-4 border-t border-white/10 px-5 py-5 md:hidden">
            <a
              href="#features"
              onClick={() => setMobileMenu(false)}
              className="block text-gray-300"
            >
              Features
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenu(false)}
              className="block text-gray-300"
            >
              Roles
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenu(false)}
              className="block text-gray-300"
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenu(false)}
              className="block text-gray-300"
            >
              About
            </a>
            <Link
              href="/interview"
              className="block rounded-xl bg-fuchsia-600 px-4 py-3 text-center font-semibold"
            >
              Start Practicing
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-center"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(168,85,247,0.12),transparent_45%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/[0.08] px-4 py-2 text-sm text-violet-300">
              <Sparkles size={16} />
              AI-Powered Interview Preparation
            </div>

            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Practice
              <br />
              smarter.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Interview
                <br />
                better.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
              MockMate helps you prepare for technical and HR interviews
              through realistic AI-powered mock interviews, feedback and
              performance tracking.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/interview"
                className="inline-flex items-center gap-3 rounded-xl bg-fuchsia-600 px-6 py-4 font-semibold shadow-lg shadow-fuchsia-600/20 transition hover:-translate-y-0.5 hover:bg-fuchsia-500"
              >
                Start Practicing
                <ArrowRight size={19} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 font-semibold transition hover:bg-white/[0.07]"
              >
                <Play size={17} />
                How It Works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-400" />
                AI-powered practice
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-400" />
                Instant feedback
              </span>
            </div>
          </div>

          {/* Interview preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-violet-600/10 to-fuchsia-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#101014] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-xs text-gray-500">
                    MockMate Interview
                  </p>
                  <h2 className="mt-1 font-semibold">
                    Java Developer
                  </h2>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  AI Ready
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <MessageSquare size={23} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Question 04</p>
                    <p className="text-sm font-medium text-violet-300">
                      Technical Round
                    </p>
                  </div>
                </div>

                <h3 className="mt-7 text-lg font-semibold leading-8">
                  What is the difference between an interface and an
                  abstract class in Java?
                </h3>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-400">
                      <MessageSquare size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Practice your answer
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">Ready</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Technical", value: "88%", color: "text-emerald-400" },
                    { label: "Confidence", value: "82%", color: "text-fuchsia-400" },
                    { label: "Overall", value: "85%", color: "text-violet-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:p-4"
                    >
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`mt-2 text-xl font-bold ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Features
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Everything you need to prepare
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              Practice at your own pace and build the confidence to face
              your next interview.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: "AI-Generated Questions",
                desc: "Get interview questions tailored to your role, topic and difficulty.",
              },
              {
                icon: MessageSquare,
                title: "Multiple Practice Modes",
                desc: "Prepare with multiple-choice questions and interview-style questions.",
              },
              {
                icon: TrendingUp,
                title: "Performance Feedback",
                desc: "Review your answers and discover areas where you can improve.",
              },
              {
                icon: Target,
                title: "Role-Based Preparation",
                desc: "Focus on questions relevant to the position you want.",
              },
              {
                icon: CheckCircle2,
                title: "Instant Results",
                desc: "Understand your answers and learn from your mistakes.",
              },
              {
                icon: Sparkles,
                title: "Learn at Your Pace",
                desc: "Build a regular practice routine that suits your goals.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Find your focus
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Prepare for your next role
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              Choose a career direction and start practising relevant
              interview questions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Software Developer",
              "Java Developer",
              "Frontend Developer",
              "Full Stack Developer",
              "Python Developer",
              "Data Analyst",
              "HR Interview",
              "Custom Role",
            ].map((role) => (
              <Link
                key={role}
                href="/interview"
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#101014] p-5 transition hover:border-violet-500/40"
              >
                <span className="text-sm font-medium text-gray-200">
                  {role}
                </span>
                <ArrowRight
                  size={17}
                  className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-violet-400"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Three simple steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Choose your practice",
                desc: "Select your role, topic, difficulty and question count.",
              },
              {
                number: "02",
                title: "Answer questions",
                desc: "Work through your personalized interview practice session.",
              },
              {
                number: "03",
                title: "Review and improve",
                desc: "Check your results, understand mistakes and keep practising.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
              >
                <p className="text-4xl font-extrabold text-violet-400/50">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid items-center gap-10 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.09] to-fuchsia-500/[0.04] p-7 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                About MockMate
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Turn interview anxiety into confidence.
              </h2>
            </div>
            <div>
              <p className="leading-8 text-gray-400">
                MockMate is designed to make interview preparation more
                accessible and structured. Practise questions, evaluate your
                understanding and build confidence one session at a time.
              </p>
              <Link
                href="/interview"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-violet-300 transition hover:text-fuchsia-300"
              >
                Start your preparation <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <Sparkles className="mx-auto text-fuchsia-400" size={34} />
          <h2 className="mt-5 text-3xl font-bold sm:text-5xl">
            Your next interview starts here.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
            Take the next step toward your career goals with focused
            interview practice.
          </p>
          <Link
            href="/interview"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-fuchsia-600 px-7 py-4 font-semibold transition hover:bg-fuchsia-500"
          >
            Get Started <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BrainCircuit size={22} className="text-violet-400" />
            MockMate
          </Link>
          <p className="text-sm text-gray-500">
            Practice smarter. Interview better.
          </p>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} MockMate
          </p>
        </div>
      </footer>
    </main>
  );
}