"use client";

import { useEffect, useState } from "react";
import { pad2, timeUntil } from "@/lib/format";

export function CountdownPill({
  labelFr,
  locksAt,
}: {
  labelFr: string;
  locksAt: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  void now;
  const t = timeUntil(locksAt);
  const closing = t.totalMs > 0 && t.totalMs < 1000 * 60 * 60 * 24; // < 24h
  const locked = t.totalMs <= 0;
  const tone = locked
    ? "var(--paper-3)"
    : closing
      ? "var(--canada)"
      : "var(--canada)";

  return (
    <div
      title={`${labelFr} — lock ${new Date(locksAt).toLocaleString("fr-FR")}`}
      className="hidden md:inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full"
      style={{ border: "1px solid var(--line-strong)" }}
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 9.5, letterSpacing: "0.14em", color: tone }}
      >
        ● {locked ? "Lock passé" : "Lock dans"}
      </span>
      {!locked && (
        <span
          className="font-mono tabular-nums"
          style={{ fontSize: 12.5, fontWeight: 500, color: "var(--paper-1)", letterSpacing: 0.4 }}
        >
          {pad2(t.days)}j&nbsp;{pad2(t.hours)}h&nbsp;{pad2(t.minutes)}m
        </span>
      )}
    </div>
  );
}
