"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Manrope, Space_Grotesk } from "next/font/google";
import LoginScene from "@/components/LoginScene";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-grotesk", display: "swap" });

const INPUT =
  "box-border w-full rounded-xl border border-white/[.14] bg-[#050710]/45 px-3.5 py-[13px] text-sm text-[#F3F4F8] placeholder-white/30 outline-none transition focus:border-[#D6247E] focus:ring-2 focus:ring-[#D6247E]/40";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      setLocked(res.status === 423);
      return;
    }
    router.push("/pipeline");
    router.refresh();
  }

  return (
    // Covers the app shell (header/tabs) so the sign-in scene is full-bleed.
    <div className={`${manrope.className} ${grotesk.variable} fixed inset-0 z-50 overflow-auto bg-[#070912]`}>
      <LoginScene />
      <div className="relative z-10 flex min-h-full items-center justify-center px-4 py-10 xl:justify-end xl:pr-[72px]">
        <div
          className="lp-card box-border w-full max-w-[420px] rounded-[28px] border border-white/[.16] px-8 pb-9 pt-11 sm:px-10"
          style={{
            background: "linear-gradient(165deg, rgba(255,255,255,.09), rgba(255,255,255,.03))",
            backdropFilter: "blur(22px)",
            boxShadow: "0 50px 90px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.03), inset 0 1px 0 rgba(255,255,255,.18)",
          }}
        >
          {/* the scene carries the brand on wide screens; show it here otherwise */}
          <div className="mb-6 flex items-center gap-3 xl:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/launch-logo.png" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" />
            <span className="font-[family-name:var(--font-grotesk)] text-2xl font-bold text-[#F3F4F8]">Launch</span>
          </div>

          <div className="text-[11px] uppercase tracking-[2px] text-[#8A90A8]">Skills &amp; Partnership Intelligence</div>
          <h1 className="mb-1.5 mt-3.5 font-[family-name:var(--font-grotesk)] text-[26px] font-semibold text-[#F6F7FC]">Welcome back</h1>
          <p className="mb-7 text-sm leading-normal text-[#9BA1C0]">
            Sign in to track certification pipelines, partner readiness, and the business capability they create.
          </p>

          {locked ? (
            <div role="alert" className="rounded-xl border border-red-300/50 bg-red-500/20 p-3 text-sm text-red-100">
              <p className="font-semibold">Account locked</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-xs font-semibold tracking-[.4px] text-[#C7CBE6]">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className={INPUT}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-semibold tracking-[.4px] text-[#C7CBE6]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className={INPUT}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-200">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-1.5 w-full rounded-xl px-3.5 py-3.5 text-sm font-bold tracking-[.3px] text-white shadow-[0_18px_30px_-12px_rgba(214,36,126,.56)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
                style={{ background: "linear-gradient(120deg, #16305C, #D6247E 55%, #F2541B)" }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <p className="text-center text-[13px] text-[#8A90A8]">Forgot your password? Ask your admin to reset it.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
