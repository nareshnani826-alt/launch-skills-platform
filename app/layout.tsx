import type { Metadata } from "next";
import TabNav from "@/components/TabNav";
import AuthStatus from "@/components/AuthStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "Launch Skills & Partnership Intelligence",
  description: "Certification & Partner Readiness Platform — FDE Pod accelerator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold">Launch Skills &amp; Partnership Intelligence</h1>
              <p className="text-sm text-neutral-500">Certification &amp; Partner Readiness Platform</p>
            </div>
            <AuthStatus />
          </div>
        </header>
        <TabNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
