"use client";

import { useEffect, useState } from "react";

type Phase = "fueling" | "igniting" | "launching" | "celebrating" | "reset";

const DURATIONS: Record<Phase, number> = {
  fueling: 3200,
  igniting: 900,
  launching: 2600,
  celebrating: 2600,
  reset: 300,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  fueling: "igniting",
  igniting: "launching",
  launching: "celebrating",
  celebrating: "reset",
  reset: "fueling",
};

const CAPTIONS: Record<Phase, string> = {
  fueling: "Loading certifications as fuel…",
  igniting: "Certification complete. Ignition sequence go.",
  launching: "🚀 Launching skills into the market…",
  celebrating: "🎉 Opportunity matched — job offer landed!",
  reset: "Loading certifications as fuel…",
};

const FUEL_BADGES = [
  { label: "AZ-204", fx: "-150px", fy: "-40px", delay: "0s" },
  { label: "Claude Certified", fx: "140px", fy: "-60px", delay: "0.55s" },
  { label: "Databricks", fx: "-120px", fy: "60px", delay: "1.1s" },
  { label: "MCP Practitioner", fx: "130px", fy: "70px", delay: "1.65s" },
  { label: "AI-102", fx: "0px", fy: "-110px", delay: "2.2s" },
];

const STARS = Array.from({ length: 24 }, (_, i) => ({
  top: `${(i * 37) % 55}%`,
  left: `${(i * 53) % 100}%`,
  delay: `${(i % 6) * 0.5}s`,
}));

const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  left: `${8 + i * 6.5}%`,
  color: ["#CDEEFE", "#80379B", "#DE1B83", "#C41874", "#6B2F85"][i % 5],
  delay: `${(i % 5) * 0.12}s`,
}));

export default function CertificationHero() {
  const [phase, setPhase] = useState<Phase>("fueling");

  useEffect(() => {
    const timer = setTimeout(() => setPhase(NEXT_PHASE[phase]), DURATIONS[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  const departed = phase === "launching" || phase === "celebrating";
  const rocketTransform = departed ? "translateY(-620px) scale(0.55)" : "translateY(0) scale(1)";
  const rocketTransition = phase === "reset" ? "none" : "transform 2.6s cubic-bezier(0.55,0,0.2,1), opacity 0.3s";
  const rocketOpacity = phase === "reset" ? 0 : 1;
  const shaking = phase === "igniting";
  const flameOn = phase === "igniting" || phase === "launching";
  const fueling = phase === "fueling";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-navy via-[#1a1330] to-launch-purple-deep">
      {/* signature diagonal brand glow */}
      <div className="launch-gradient absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full opacity-20 blur-3xl" />

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

      {/* launch pad */}
      <div className="absolute bottom-[6%] left-1/2 h-2 w-40 -translate-x-1/2 rounded-full bg-black/30 blur-sm sm:w-56" />
      <svg
        className="absolute bottom-[6%] left-1/2 h-10 w-40 -translate-x-1/2 sm:w-56"
        viewBox="0 0 200 40"
        fill="none"
        stroke="#80379B"
        strokeWidth="2"
      >
        <path d="M60 40 L92 4 M140 40 L108 4" />
        <path d="M40 40 L160 40" />
      </svg>

      {/* fuel badges flying in during fueling phase */}
      {FUEL_BADGES.map((b) => (
        <div
          key={b.label}
          className={`absolute bottom-[12%] left-1/2 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur-sm sm:text-xs ${
            fueling ? "cert-fuel-in" : "opacity-0"
          }`}
          style={{ "--fx": b.fx, "--fy": b.fy, "--fdelay": b.delay } as React.CSSProperties}
        >
          🎓 {b.label}
        </div>
      ))}

      {/* rocket */}
      <div
        className={`absolute bottom-[8%] left-1/2 -translate-x-1/2 ${shaking ? "cert-rocket-shake" : ""}`}
        style={{ transform: `translateX(-50%) ${rocketTransform}`, transition: rocketTransition, opacity: rocketOpacity }}
      >
        <svg width="60" height="150" viewBox="0 0 60 150" className="overflow-visible">
          {/* flame */}
          <path
            className={`cert-flame origin-top ${flameOn ? "opacity-100" : "opacity-0"}`}
            d="M22 100 Q30 125 22 145 Q30 138 38 145 Q30 125 38 100 Z"
            fill="url(#flameGradient)"
          />
          <defs>
            <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CDEEFE" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#DE1B83" />
            </linearGradient>
          </defs>

          {/* body */}
          <g fill="none" stroke="#f5efe0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30 0 Q20 22 20 40 L40 40 Q40 22 30 0 Z" />
            <path d="M20 40 L20 92 Q20 98 26 100 L34 100 Q40 98 40 92 L40 40 Z" />
            <path d="M20 78 L6 100 L20 94 Z" />
            <path d="M40 78 L54 100 L40 94 Z" />
            <line x1="20" y1="55" x2="40" y2="55" stroke="#DE1B83" strokeWidth="3" />
            <circle cx="30" cy="66" r="6" />
          </g>
        </svg>
      </div>

      {/* celebration burst */}
      {phase === "celebrating" && (
        <>
          <div className="absolute left-1/2 top-[10%] -translate-x-1/2 text-4xl">🌟</div>
          <div className="absolute left-1/2 top-[20%] -translate-x-1/2 text-3xl">💼</div>
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="cert-confetti absolute top-[10%] h-2 w-2 rounded-sm"
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
