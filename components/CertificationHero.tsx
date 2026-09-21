"use client";

import { useRef, useState } from "react";

const FLOATING_CARDS = [
  { label: "AZ-204", top: "8%", left: "6%", z: 40, delay: "0s", rot: "-8deg" },
  { label: "Claude Certified", top: "62%", left: "2%", z: 10, delay: "1.2s", rot: "6deg" },
  { label: "Databricks", top: "12%", left: "72%", z: 20, delay: "2.1s", rot: "5deg" },
  { label: "MCP Practitioner", top: "68%", left: "68%", z: 60, delay: "0.6s", rot: "-4deg" },
];

export default function CertificationHero() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 14 });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      ref={sceneRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="cert-scene relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#241f4e] via-[#3a2f7a] to-[#5b4bff] sm:h-96"
    >
      <div className="cert-glow absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/40 blur-3xl" />

      {FLOATING_CARDS.map((c) => (
        <div
          key={c.label}
          className="cert-badge-card absolute rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
          style={
            {
              top: c.top,
              left: c.left,
              "--fdelay": c.delay,
              "--fr": c.rot,
              transform: `translateZ(${c.z}px)`,
            } as React.CSSProperties
          }
        >
          🎓 {c.label}
        </div>
      ))}

      <div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out sm:h-36 sm:w-36"
        style={{ transform: `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="cert-coin relative h-full w-full">
          <div className="cert-coin-face absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-2xl">
            <span className="text-3xl sm:text-4xl">✓</span>
            <span className="mt-1 text-[9px] font-bold tracking-widest sm:text-[10px]">CERTIFIED</span>
          </div>
          <div className="cert-coin-face cert-coin-face--back absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-amber-300 text-amber-950 shadow-2xl">
            <span className="text-3xl sm:text-4xl">★</span>
            <span className="mt-1 text-[9px] font-bold tracking-widest sm:text-[10px]">SKILLS</span>
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 left-1/2 w-full -translate-x-1/2 text-center text-xs text-white/70">
        Certifications tracked, matched, and put to work.
      </p>
    </div>
  );
}
