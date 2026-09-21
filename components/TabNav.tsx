"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/pipeline", label: "1. Pipeline Tracking" },
  { href: "/partner-readiness", label: "2. Partner Readiness" },
  { href: "/opportunity-matching", label: "3. Opportunity Matching" },
  { href: "/roi", label: "4. ROI Dashboard" },
  { href: "/pod-assistant", label: "5. Pod Formation Assistant" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
