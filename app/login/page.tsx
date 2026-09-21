"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CertificationHero from "@/components/CertificationHero";

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
    <>
      <CertificationHero />
      <div className="flex min-h-[75vh] items-center justify-center">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">Login</h2>
            <p className="text-sm text-white/70">Sign in to access the platform.</p>
          </div>

          {locked ? (
            <div className="rounded border border-red-300/50 bg-red-500/20 p-3 text-sm text-red-100">
              <p className="font-semibold">Account locked</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/70">Username</label>
                <input
                  className="mt-1 w-full rounded border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-200">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
