import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/Header";
import { getNextDeadline } from "@/lib/phases";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  style: ["italic", "normal"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ui = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pick'em WC26",
  description:
    "Le pick'em façon esport sur la Coupe du Monde 2026. Entre potes. Zéro mail. Zéro argent.",
};

export const viewport: Viewport = {
  themeColor: "#0F0D0C",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const next = await getNextDeadline().catch(() => null);

  return (
    <html
      lang="fr"
      className={`${display.variable} ${ui.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <SessionProvider>
          <Header
            nextPhase={
              next
                ? {
                    id: next.id,
                    labelFr: next.labelFr,
                    locksAt: next.locksAt.toISOString(),
                  }
                : null
            }
          />
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-[color:var(--line)] py-5 px-8 mt-16">
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
              <span className="label">Pick&apos;em WC26 — Édition 01</span>
              <span className="label">Entre potes · Zéro mail · Zéro argent</span>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
