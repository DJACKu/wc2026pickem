"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { label: "PICKS", href: "/picks" },
  { label: "AUJOURD'HUI", href: "/today" },
  { label: "BRACKET", href: "/picks/r32" },
  { label: "CLASSEMENT", href: "/leaderboard" },
  { label: "MES POTES", href: "/groups" },
];

export function HeaderNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname() ?? "";
  const links = isAdmin
    ? [...baseLinks, { label: "ADMIN", href: "/admin" }]
    : baseLinks;

  return (
    <nav className="hidden md:flex items-center gap-6 ml-2">
      {links.map((l) => {
        const active =
          l.href === "/picks"
            ? pathname === "/picks" || pathname.startsWith("/picks/groups")
            : l.href === "/picks/r32"
              ? pathname.startsWith("/picks/r")
                || pathname.startsWith("/picks/qf")
                || pathname.startsWith("/picks/sf")
                || pathname.startsWith("/picks/final")
              : pathname.startsWith(l.href);
        const isAdminLink = l.label === "ADMIN";
        return (
          <Link
            key={l.href}
            href={l.href}
            className="font-mono text-[11px] tracking-[0.12em] uppercase pb-0.5"
            style={{
              color: active
                ? (isAdminLink ? "var(--gold)" : "var(--paper-1)")
                : (isAdminLink ? "color-mix(in srgb, var(--gold) 50%, transparent)" : "var(--paper-3)"),
              borderBottom: active
                ? (isAdminLink ? "1px solid var(--gold)" : "1px solid var(--paper-1)")
                : "1px solid transparent",
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
