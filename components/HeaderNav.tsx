"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "PICKS", href: "/picks" },
  { label: "AUJOURD'HUI", href: "/today" },
  { label: "BRACKET", href: "/picks/bracket" },
  { label: "CLASSEMENT", href: "/leaderboard" },
  { label: "MES POTES", href: "/groups" },
  { label: "ADMIN", href: "/admin", adminOnly: true },
];

export function HeaderNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname() ?? "";
  const links = NAV_LINKS.filter((l) => !l.adminOnly || isAdmin);

  return (
    <nav className="hidden md:flex items-center gap-6 ml-2">
      {links.map((l) => {
        const active =
          l.href === "/picks"
            ? pathname === "/picks" || pathname.startsWith("/picks/groups")
            : l.href === "/picks/bracket"
              ? pathname.startsWith("/picks/bracket")
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
