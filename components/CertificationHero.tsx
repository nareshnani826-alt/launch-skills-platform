"use client";

import { useEffect, useState } from "react";

type Phase = "running" | "arriving" | "celebrating" | "reset";

const DURATIONS: Record<Phase, number> = {
  running: 4500,
  arriving: 1200,
  celebrating: 2800,
  reset: 300,
};

const MILESTONES = [
  { label: "Planned", bottom: "20%", scale: 1 },
  { label: "Registered", bottom: "34%", scale: 0.86 },
  { label: "Learning", bottom: "47%", scale: 0.72 },
  { label: "Exam", bottom: "58%", scale: 0.6 },
  { label: "Certified", bottom: "68%", scale: 0.5 },
];

const CAPTIONS: Record<Phase, string> = {
  running: "Tracking every certification milestone…",
  arriving: "Certification complete.",
  celebrating: "🎉 Opportunity matched — job offer landed!",
  reset: "Tracking every certification milestone…",
};

const STARS = Array.from({ length: 24 }, (_, i) => ({
  top: `${(i * 37) % 55}%`,
  left: `${(i * 53) % 100}%`,
  delay: `${(i % 6) * 0.5}s`,
}));

const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  left: `${8 + i * 6.5}%`,
  color: ["#fbbf24", "#5b4bff", "#34d399", "#f472b6", "#60a5fa"][i % 5],
  delay: `${(i % 5) * 0.12}s`,
}));

export default function CertificationHero() {
  const [phase, setPhase] = useState<Phase>("running");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase((prev) => {
        if (prev === "running") return "arriving";
        if (prev === "arriving") return "celebrating";
        if (prev === "celebrating") return "reset";
        return "running";
      });
    }, DURATIONS[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  const runnerAdvancing = phase === "running" || phase === "arriving" || phase === "celebrating";
  const runnerTransform = runnerAdvancing ? "translateY(-230px) scale(0.34)" : "translateY(0) scale(1)";
  const runnerTransition = phase === "reset" ? "none" : "transform 4.5s cubic-bezier(0.45,0,0.2,1), opacity 0.3s";
  const runnerOpacity = phase === "reset" ? 0 : 1;
  const goalActive = phase === "arriving" || phase === "celebrating";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#151233] via-[#241f4e] to-[#3a2f7a]">
      {/* sky */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="cert-star absolute h-1 w-1 rounded-full bg-white"
          style={{ top: s.top, left: s.left, "--sdelay": s.delay } as React.CSSProperties}
        />
      ))}
      <div
        className="cert-cloud absolute left-[5%] top-[10%] h-10 w-40 rounded-full bg-white/10 blur-2xl"
        style={{ "--cdur": "22s" } as React.CSSProperties}
      />
      <div
        className="cert-cloud absolute left-[55%] top-[18%] h-14 w-56 rounded-full bg-white/10 blur-2xl"
        style={{ "--cdur": "26s", "--cdelay": "4s" } as React.CSSProperties}
      />

      {/* goal: office building at the horizon */}
      <div
        className={`cert-goal absolute left-1/2 top-[16%] -translate-x-1/2 text-5xl sm:text-6xl ${
          goalActive ? "is-active" : ""
        }`}
      >
        🏢
      </div>
      <p className="absolute left-1/2 top-[26%] -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-amber-200/80 sm:text-xs">
        Opportunity Matched
      </p>

      {/* perspective road */}
      <div
        className="absolute bottom-0 left-1/2 h-[70%] w-[70%] -translate-x-1/2 sm:w-[46%]"
        style={{ clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)" }}
      >
        <div className="h-full w-full bg-gradient-to-t from-[#1c1840] to-[#2d2766]" />
        <div
          className="cert-road-line absolute left-1/2 top-0 h-full w-1 -translate-x-1/2"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, rgba(251,191,36,0.85) 0 24px, transparent 24px 48px)",
          }}
        />
      </div>

      {/* milestones along the road */}
      {MILESTONES.map((m) => (
        <div
          key={m.label}
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
          style={{ bottom: m.bottom, transform: `translateX(-50%) scale(${m.scale})` }}
        >
          <div className="cert-milestone-dot h-3 w-3 rounded-full bg-amber-300" style={{ "--mdelay": "0.3s" } as React.CSSProperties} />
          <span className="mt-1 whitespace-nowrap text-[10px] font-medium text-white/70">{m.label}</span>
        </div>
      ))}

      {/* runner */}
      <div
        className={`cert-runner absolute bottom-[6%] left-1/2 -translate-x-1/2 ${runnerAdvancing ? "is-moving" : ""} ${
          phase === "celebrating" ? "is-celebrating" : ""
        }`}
        style={{ transform: `translateX(-50%) ${runnerTransform}`, transition: runnerTransition, opacity: runnerOpacity }}
      >
        <svg
          className="cert-runner-body-group h-24 w-16 overflow-visible"
          viewBox="0 0 64 100"
          fill="none"
          stroke="#f5efe0"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* head + hairline */}
          <circle cx="32" cy="12" r="8" />
          <path d="M25 8 Q32 2 39 8" strokeWidth="1.6" />
          {/* neck */}
          <line x1="32" y1="20" x2="32" y2="24" />
          {/* suit jacket */}
          <path d="M23 24 L41 24 L37 53 L27 53 Z" />
          {/* lapels */}
          <path d="M27 24 L32 35 L37 24" strokeWidth="1.6" />
          {/* tie */}
          <path
            d="M30.5 25.5 L33.5 25.5 L35 45 L32 50 L29 45 Z"
            fill="#f5a524"
            stroke="#b3760f"
            strokeWidth="1"
          />

          {/* back arm */}
          <g className="cert-arm-back" style={{ transformBox: "fill-box", transformOrigin: "top center" }}>
            <path d="M38 26 L45 37 L41 47" />
          </g>
          {/* front arm */}
          <g className="cert-arm-front" style={{ transformBox: "fill-box", transformOrigin: "top center" }}>
            <path d="M26 26 L19 37 L23 47" />
          </g>

          {/* back leg */}
          <g className="cert-leg-back" style={{ transformBox: "fill-box", transformOrigin: "top center" }}>
            <path d="M35 53 L41 69 L37 83" />
            <path d="M37 83 L44 85" strokeWidth="2" />
          </g>
          {/* front leg */}
          <g className="cert-leg-front" style={{ transformBox: "fill-box", transformOrigin: "top center" }}>
            <path d="M29 53 L23 69 L27 83" />
            <path d="M27 83 L20 85" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* celebration burst */}
      {phase === "celebrating" && (
        <>
          <div className="absolute left-1/2 top-[14%] -translate-x-1/2 text-4xl">💼</div>
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="cert-confetti absolute top-[14%] h-2 w-2 rounded-sm"
              style={{ left: c.left, backgroundColor: c.color, "--pdelay": c.delay } as React.CSSProperties}
            />
          ))}
        </>
      )}

      {/* caption banner */}
      <div key={phase} className="cert-banner absolute bottom-[6%] left-1/2 w-full max-w-sm px-4 text-center">
        <p className="rounded-full bg-black/30 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:text-sm">
          {CAPTIONS[phase]}
        </p>
      </div>
    </div>
  );
}
