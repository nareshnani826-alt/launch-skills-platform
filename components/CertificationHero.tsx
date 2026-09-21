const NODES = [
  { x: 15, y: 20 }, { x: 35, y: 12 }, { x: 55, y: 25 }, { x: 75, y: 15 }, { x: 85, y: 35 },
  { x: 20, y: 50 }, { x: 45, y: 45 }, { x: 65, y: 55 }, { x: 30, y: 75 }, { x: 60, y: 80 },
  { x: 80, y: 65 }, { x: 50, y: 90 },
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [4, 10],
  [5, 6], [6, 7], [5, 8], [6, 9], [7, 10], [8, 9], [9, 11], [10, 11],
];

export default function CertificationHero() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-navy via-[#150f2e] to-launch-purple-deep">
      {/* slow-drifting gradient blobs */}
      <div className="cert-blob cert-blob-1 absolute h-[50vw] w-[50vw] rounded-full bg-launch-purple/25 blur-3xl" />
      <div className="cert-blob cert-blob-2 absolute h-[40vw] w-[40vw] rounded-full bg-launch-pink/20 blur-3xl" />
      <div className="cert-blob cert-blob-3 absolute h-[35vw] w-[35vw] rounded-full bg-launch-cyan/10 blur-3xl" />

      {/* faint dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* slow-rotating orbit ring */}
      <svg
        className="cert-orbit absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 opacity-20"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="#CDEEFE" strokeWidth="0.3" strokeDasharray="1 3" />
      </svg>

      {/* network mesh */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map(([a, b], i) => (
          <line
            key={i}
            className="cert-link"
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="#CDEEFE"
            strokeWidth="0.15"
            strokeDasharray="1.2 2.4"
            style={{ animationDelay: `${(i % 6) * 0.5}s`, animationDuration: `${4 + (i % 5)}s` }}
          />
        ))}
        {NODES.map((n, i) => (
          <circle
            key={i}
            className="cert-node"
            cx={n.x}
            cy={n.y}
            r="0.6"
            fill="#DE1B83"
            style={{ animationDelay: `${(i % 8) * 0.35}s` }}
          />
        ))}
      </svg>

      {/* brand mark */}
      <div className="cert-fade-in absolute bottom-[10%] left-1/2 w-full max-w-md -translate-x-1/2 px-4 text-center">
        <p className="launch-gradient-text text-2xl font-bold tracking-tight sm:text-3xl">Launch</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/50 sm:text-sm">
          Certification &amp; Partner Readiness Platform
        </p>
      </div>
    </div>
  );
}
