import type { CSSProperties } from "react";

const A1 = "#16305C";
const A2 = "#D6247E";
const A3 = "#F2541B";

const ORBITS = [
  { size: 340, spin: 34, offset: 0, color: A1, dot: "#EAF0FF", travel: 3.1, delay: 0, label: "Microsoft · AZ‑400", ring: 0.14 },
  { size: 470, spin: 46, offset: -14, color: A2, dot: "#FFE9F5", travel: 3.6, delay: 0.4, label: "Anthropic · Agentic Dev", ring: 0.1 },
  { size: 600, spin: 58, offset: -30, color: A3, dot: "#FFF0E4", travel: 4.2, delay: 0.8, label: "Databricks · Data Eng", ring: 0.08 },
];

const STAGES = [
  { label: "Planned", left: 0, color: A1, shift: "0%" },
  { label: "Registered", left: 25, color: A1, shift: "-50%" },
  { label: "In Learning", left: 50, color: A2, shift: "-50%" },
  { label: "Exam Scheduled", left: 75, color: A2, shift: "-50%" },
  { label: "Certified", left: 100, color: A3, shift: "-100%" },
];

const BARS = [A1, A2, A3, A2];

// Ambient drifting motes scattered across the otherwise-empty parts of the scene.
const PARTICLES = [
  { left: "16%", top: "16%", size: 3, color: "#EAF0FF", anim: "lp-particle-1", duration: 7.2, delay: 0 },
  { left: "36%", top: "80%", size: 4, color: A3, anim: "lp-particle-2", duration: 8.6, delay: 1.2 },
  { left: "54%", top: "12%", size: 3, color: A2, anim: "lp-particle-1", duration: 6.4, delay: 0.6 },
  { left: "64%", top: "62%", size: 2, color: "#FFFFFF", anim: "lp-particle-2", duration: 9.2, delay: 2 },
  { left: "71%", top: "18%", size: 3, color: A1, anim: "lp-particle-1", duration: 7.8, delay: 1.6 },
  { left: "80%", top: "72%", size: 4, color: A2, anim: "lp-particle-2", duration: 8, delay: 0.3 },
  { left: "29%", top: "46%", size: 2, color: "#FFFFFF", anim: "lp-particle-1", duration: 6, delay: 2.4 },
  { left: "88%", top: "40%", size: 3, color: A3, anim: "lp-particle-2", duration: 7.4, delay: 1 },
];

const GLASS: CSSProperties = {
  background: "linear-gradient(165deg, rgba(255,255,255,.09), rgba(255,255,255,.02))",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,.14)",
};

const PILL: CSSProperties = {
  background: "rgba(10,14,30,.6)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,.14)",
  boxShadow: "0 14px 26px -12px rgba(0,0,0,.65)",
};

// Decorative background for the sign-in page. Purely visual, so hidden from assistive tech.
export default function LoginScene() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* animated aurora mesh */}
      <div
        className="lp-aurora absolute"
        style={{
          inset: "-10%",
          backgroundImage: `radial-gradient(38% 32% at 22% 28%, ${A2}3d 0%, transparent 70%), radial-gradient(34% 30% at 68% 66%, ${A3}33 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(165deg, #070912 0%, #0A0F22 55%, #0B0E1E 100%)", opacity: 0.78 }}
      />

      {/* faint starfield */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.4,
          backgroundRepeat: "no-repeat",
          backgroundImage: [
            "radial-gradient(1.5px 1.5px at 90px 130px, #fff 100%, transparent 0)",
            "radial-gradient(1px 1px at 240px 70px, #fff 100%, transparent 0)",
            "radial-gradient(1.5px 1.5px at 380px 310px, #fff 100%, transparent 0)",
            "radial-gradient(1px 1px at 150px 430px, #fff 100%, transparent 0)",
            "radial-gradient(1.5px 1.5px at 640px 100px, #fff 100%, transparent 0)",
            "radial-gradient(1px 1px at 70px 700px, #fff 100%, transparent 0)",
          ].join(", "),
        }}
      />

      <div className="lp-network absolute inset-0">
        {/* brand */}
        <div className="absolute flex flex-col gap-1.5" style={{ left: 64, top: 56 }}>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/launch-logo.png" alt="" width={38} height={38} className="h-[38px] w-[38px] object-contain drop-shadow-lg" />
            <div className="font-[family-name:var(--font-grotesk)] text-[26px] font-bold tracking-[.5px] text-[#F3F4F8]">Launch</div>
          </div>
          <div className="ml-11 text-xs uppercase tracking-[2.2px] text-[#8A90A8]">Skills &amp; Partnership Intelligence</div>
        </div>

        {/* ambient drifting motes — fill the open space around the scene */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}66`,
              animation: `${p.anim} ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}

        {/* orbit network, centred on the hub */}
        <div className="absolute h-0 w-0" style={{ left: 460, top: "51%" }}>
          {ORBITS.map((o) => (
            <div
              key={o.label}
              className="absolute rounded-full"
              style={{
                width: o.size,
                height: o.size,
                margin: `${-o.size / 2}px 0 0 ${-o.size / 2}px`,
                border: `1px dashed rgba(255,255,255,${o.ring})`,
                animation: `lp-spin ${o.spin}s linear infinite ${o.offset}s`,
              }}
            >
              <div
                className="absolute"
                style={{
                  left: "50%",
                  top: 0,
                  width: 2,
                  height: o.size / 2,
                  transform: "translateX(-50%)",
                  background: `linear-gradient(180deg, transparent, ${o.color}aa 70%, ${o.color})`,
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    left: "50%",
                    top: "2%",
                    width: 7,
                    height: 7,
                    transform: "translateX(-50%)",
                    background: o.dot,
                    boxShadow: `0 0 10px 3px ${o.dot}cc`,
                    animation: `lp-travel ${o.travel}s linear infinite ${o.delay}s`,
                  }}
                />
              </div>
              <div
                className="absolute flex items-center gap-2 whitespace-nowrap rounded-full py-[7px] pl-2.5 pr-3.5"
                style={{
                  ...PILL,
                  left: "50%",
                  top: -18,
                  transform: "translateX(-50%)",
                  animation: `lp-counterspin ${o.spin}s linear infinite ${o.offset}s`,
                }}
              >
                <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: o.color }} />
                <span className="text-xs font-semibold text-[#E4E6F2]">{o.label}</span>
              </div>
            </div>
          ))}

          {/* hub */}
          <div className="absolute" style={{ left: 0, top: 0 }}>
            <div
              className="absolute rounded-full"
              style={{
                left: 0,
                top: 0,
                width: 200,
                height: 200,
                transform: "translate(-50%,-50%)",
                background: `radial-gradient(closest-side, ${A2}50, transparent 72%)`,
                filter: "blur(10px)",
                animation: "lp-glow 4.5s ease-in-out infinite",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 150, height: 150, margin: "-75px 0 0 -75px", border: "1px solid rgba(255,255,255,.2)", animation: "lp-spin 26s linear infinite" }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 92, height: 92, margin: "-46px 0 0 -46px", border: "1px dashed rgba(255,255,255,.28)", animation: "lp-counterspin-plain 18s linear infinite" }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 14,
                height: 14,
                margin: "-7px 0 0 -7px",
                background: `radial-gradient(circle at 32% 28%, #fff, ${A2} 70%)`,
                boxShadow: `0 0 18px 6px ${A2}99`,
              }}
            />
          </div>
        </div>

        {/* animated data beam linking the orbit to the readiness card, filling the gap between them */}
        <div className="lp-tall-only absolute" style={{ left: 760, top: "51%", width: 120 }}>
          <div className="absolute inset-x-0" style={{ top: 0, borderTop: "1px dashed rgba(255,255,255,.22)" }} />
          <div
            className="absolute rounded-full"
            style={{
              top: -3,
              left: 0,
              width: 6,
              height: 6,
              background: A2,
              boxShadow: `0 0 10px 3px ${A2}aa`,
              animation: "lp-beam-travel 3.4s ease-in-out infinite",
            }}
          />
        </div>

        {/* floating readiness / ROI card — vertically centred to match the hub / sign-in card, */}
        {/* pushed clear of the orbit's 300px max radius (hub is at left:460) so the spinning rings/spokes never cross it */}
        <div className="lp-tall-only absolute w-[300px]" style={{ left: 880, top: "51%", transform: "translateY(-50%)" }}>
          <div style={{ animation: "lp-float 6s ease-in-out infinite" }}>
            <div
              className="box-border rounded-[20px] px-[22px] pb-[18px] pt-[22px]"
              style={{
                ...GLASS,
                transform: "perspective(1200px) rotateY(-7deg) rotateX(3deg)",
                boxShadow: "0 36px 60px -22px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.14)",
              }}
            >
              <div className="mb-3.5 text-[11px] uppercase tracking-[1.4px] text-[#9BA1C0]">Live Partner Readiness</div>
              <div className="flex items-center gap-5">
                <svg width="108" height="108" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={A2}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="314"
                    strokeDashoffset="110"
                    transform="rotate(-90 60 60)"
                    style={{ animation: "lp-ring 5s ease-in-out infinite" }}
                  />
                  <text x="60" y="66" textAnchor="middle" fontFamily="var(--font-grotesk), sans-serif" fontSize="24" fontWeight="700" fill="#F3F4F8">
                    74%
                  </text>
                </svg>
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="text-xs text-[#C7CBE6]">Certification ROI</div>
                  <div className="flex h-[46px] items-end gap-1.5">
                    {BARS.map((color, i) => (
                      <div
                        key={i}
                        className="h-full w-2.5 rounded-t-[4px]"
                        style={{ background: color, transformOrigin: "bottom", animation: `lp-bar 3.4s ease-in-out infinite ${i * 0.3}s` }}
                      />
                    ))}
                  </div>
                  <div className="text-[13px] font-bold text-[#F3F4F8]">$830K influenced</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* certification pipeline stepper */}
        <div className="lp-tall-only absolute" style={{ left: 64, bottom: 84, width: 520 }}>
          <div className="mb-3 text-[11px] uppercase tracking-[1.4px] text-[#7B8199]">Certification Pipeline · Leading Indicators</div>
          <div className="relative h-0.5 rounded-sm bg-white/[.12]">
            <div
              className="absolute rounded-full bg-white"
              style={{ top: "50%", width: 9, height: 9, marginTop: -4, boxShadow: "0 0 12px 4px #ffffffaa", animation: "lp-dot 5s linear infinite" }}
            />
            {STAGES.map((s, i) => (
              <div
                key={s.label}
                className="absolute flex flex-col items-center gap-2"
                style={{ left: `${s.left}%`, top: "50%", transform: `translate(${s.shift},-50%)` }}
              >
                <div className="h-3 w-3 rounded-full" style={{ background: s.color, animation: `lp-stage 5s ease-in-out infinite ${i}s` }} />
                <span className="whitespace-nowrap text-[11px] text-[#9BA1C0]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer credit */}
        <div className="absolute text-xs tracking-[.5px] text-[#5C6285]" style={{ left: 64, bottom: 34 }}>
          An FDE Pod Accelerator product
        </div>
      </div>
    </div>
  );
}
