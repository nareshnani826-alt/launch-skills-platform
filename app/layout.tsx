import type { Metadata } from "next";
import TabNav from "@/components/TabNav";
import AuthStatus from "@/components/AuthStatus";
import { getSession } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Launch Skills & Partnership Intelligence",
  description: "Certification & Partner Readiness Platform — FDE Pod accelerator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();

  return (
    <html lang="en">
      <body>
        <header className="bg-navy px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-start justify-between">
            <div>
              <h1 className="launch-gradient-text text-lg font-bold">Launch Skills &amp; Partnership Intelligence</h1>
              <p className="text-sm text-white/60">Certification &amp; Partner Readiness Platform</p>
            </div>
            {session && <AuthStatus session={session} />}
          </div>
        </header>
        {session && <TabNav role={session.role} />}
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
