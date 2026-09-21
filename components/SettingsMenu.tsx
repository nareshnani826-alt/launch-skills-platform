"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SETTINGS_TABS = [
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/users", label: "Manage Users" },
];

export default function SettingsMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        className="rounded p-1 text-lg leading-none hover:bg-white/10"
      >
        ⚙️
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded border border-neutral-200 bg-white shadow-lg">
          {SETTINGS_TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm ${
                  active ? "bg-accent/10 text-accent" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
