"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_TABS = [
  { href: "/pipeline", label: "1. Pipeline Tracking" },
  { href: "/partner-readiness", label: "2. Partner Readiness" },
  { href: "/opportunity-matching", label: "3. Opportunity Matching" },
  { href: "/roi", label: "4. ROI Dashboard" },
  { href: "/pod-assistant", label: "5. Pod Formation Assistant" },
];

const RESOURCE_TABS = [{ href: "/my-certifications", label: "My Certifications" }];

export default function TabNav({ role }: { role: "ADMIN" | "RESOURCE" }) {
  const pathname = usePathname();
  const tabs = role === "ADMIN" ? ADMIN_TABS : RESOURCE_TABS;
  return (
    <nav className="border-b border-white/10 bg-navy">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "border-launch-pink text-white" : "border-transparent text-white/50 hover:text-white/80"
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
