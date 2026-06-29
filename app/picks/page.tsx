import Link from "next/link";
import { count, eq, sum } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { getAllPhases } from "@/lib/phases";
import { formatPhaseDeadline, timeUntil, pad2 } from "@/lib/format";
import {
  db,
  groupPicks,
  matchPicks,
  matches,
  pickLocks,
  scores,
  thirdPlacePicks,
} from "@/db";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { StatusPill } from "@/components/ui/StatusPill";
import { LockIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const KO_PHASES = new Set(["r32", "r16", "qf", "sf", "final"]);

const PHASE_META: Record<
  string,
  { detail: string; maxPts: number; cta: string }
> = {
  groups: {
    detail: "12 poules à classer · 8 meilleurs 3èmes à cocher.",
    maxPts: 86,
    cta: "Continuer",
  },
  r32: {
    detail: "16 affiches · un tap par vainqueur. +5 pts par correct.",
    maxPts: 80,
    cta: "Picker R32",
  },
  r16: { detail: "8 vainqueurs à choisir. +8 pts par correct.", maxPts: 64, cta: "Picker R16" },
  qf: { detail: "4 vainqueurs. +12 pts par correct.", maxPts: 48, cta: "Picker quarts" },
  sf: { detail: "2 finalistes. +18 pts par correct.", maxPts: 36, cta: "Picker demies" },
  final: {
    detail: "Petite finale + champion du monde. +30 pts si exact.",
    maxPts: 40,
    cta: "Picker finale",
  },
};

export default async function PicksHub() {
  const user = await requireUser();
  const phasesList = await getAllPhases();

  const [gpCount, tpCount, lockedRows, koCounts, koTotals, totalScore] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(groupPicks)
        .where(eq(groupPicks.userId, user.id))
        .then((r) => Number(r[0]?.n ?? 0)),
      db
        .select({ n: count() })
        .from(thirdPlacePicks)
        .where(eq(thirdPlacePicks.userId, user.id))
        .then((r) => Number(r[0]?.n ?? 0)),
      db
        .select({ phaseId: pickLocks.phaseId })
        .from(pickLocks)
        .where(eq(pickLocks.userId, user.id)),
      db
        .select({ phaseId: matches.phaseId, n: count(matchPicks.matchId) })
        .from(matchPicks)
        .innerJoin(matches, eq(matches.id, matchPicks.matchId))
        .where(eq(matchPicks.userId, user.id))
        .groupBy(matches.phaseId),
      db
        .select({ phaseId: matches.phaseId, n: count() })
        .from(matches)
        .groupBy(matches.phaseId),
      db
        .select({ s: sum(scores.points) })
        .from(scores)
        .where(eq(scores.userId, user.id))
        .then((r) => Number(r[0]?.s ?? 0)),
    ]);

  const lockedSet = new Set(lockedRows.map((r) => r.phaseId));
  const koPicked: Record<string, number> = Object.fromEntries(
    koCounts.map((r) => [r.phaseId, Number(r.n)]),
  );
  const koTotal: Record<string, number> = Object.fromEntries(
    koTotals.map((r) => [r.phaseId, Number(r.n)]),
  );

  const maxPossible = phasesList.reduce(
    (acc, p) => acc + (PHASE_META[p.id]?.maxPts ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-8 mb-10">
        <div>
          <SectionLabel num={jLabel(phasesList[0]?.locksAt)}>Tes picks</SectionLabel>
          <Display size={64} className="mt-3.5" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
            Six phases.
            <br />
            Une seule chance par phase.
          </Display>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--paper-3)]">
            Ton score total
          </div>
          <div className="font-display leading-none mt-1 text-[color:var(--paper-1)]" style={{ fontSize: 64 }}>
            {totalScore}
            <span className="text-[28px] text-[color:var(--paper-3)]">
              {" "}/ {maxPossible}
            </span>
          </div>
          <div className="font-mono text-[11px] tracking-[0.06em] text-[color:var(--paper-3)] mt-1">
            CLASSEMENT GÉNÉRAL — N/A
          </div>
        </div>
      </div>

      {/* Phases grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {phasesList.map((p, idx) => {
          const meta = PHASE_META[p.id];
          const lockedTime = new Date(p.locksAt).getTime() <= Date.now();
          const userLocked = lockedSet.has(p.id);
          const isOpen = !lockedTime && !userLocked;

          let progress: { picked: number; total: number } | null = null;
          let href = "/picks";
          if (p.id === "groups") {
            progress = { picked: gpCount + tpCount, total: 48 + 8 };
            href = "/picks/groups";
          } else if (KO_PHASES.has(p.id)) {
            const total = koTotal[p.id] ?? 0;
            progress = { picked: koPicked[p.id] ?? 0, total };
            href = `/picks/bracket`;
          }

          const status: "open" | "locked" | "scored" | "upcoming" | "closing" =
            p.status === "scored"
              ? "scored"
              : userLocked
                ? "locked"
                : lockedTime
                  ? "locked"
                  : "open";

          return (
            <Link
              key={p.id}
              href={href}
              className="block rounded-[10px] p-[22px] min-h-[240px] grid relative"
              style={{
                background: isOpen ? "var(--ink-3)" : "var(--ink-2)",
                border: `1px solid ${isOpen ? "var(--line-strong)" : "var(--line)"}`,
                gridTemplateRows: "auto 1fr auto",
                gap: 16,
                color: "inherit",
              }}
            >
              <div className="flex items-center justify-between">
                <StatusPill status={status}>
                  {userLocked ? "LOCKÉ ✓" : status === "open" ? "OUVERT" : "VERROUILLÉ"}
                </StatusPill>
                <span className="font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--paper-4)]">
                  {String(idx + 1).padStart(2, "0")} / 06
                </span>
              </div>

              <div>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    color: isOpen ? "var(--paper-1)" : "var(--paper-2)",
                  }}
                >
                  {p.labelFr}
                </h3>
                <div className="font-mono text-[11px] mt-2 text-[color:var(--paper-3)] tracking-[0.04em]">
                  Lock {formatPhaseDeadline(p.locksAt)}
                </div>
                {meta && (
                  <p
                    className="text-[12.5px] leading-[1.5] mt-3.5"
                    style={{ color: isOpen ? "var(--paper-2)" : "var(--paper-3)" }}
                  >
                    {meta.detail}
                  </p>
                )}

                {progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.1em] text-[color:var(--paper-3)] mb-1.5">
                      <span>PROGRESSION</span>
                      <span className="tabular-nums">
                        {progress.picked}/{progress.total || "?"}
                      </span>
                    </div>
                    <div
                      className="h-[3px] rounded-full overflow-hidden"
                      style={{ background: "var(--ink-1)" }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width:
                            progress.total > 0
                              ? `${Math.min(100, (progress.picked / progress.total) * 100)}%`
                              : "0%",
                          background: isOpen ? "var(--mexico)" : "var(--paper-4)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between pt-3.5"
                style={{ borderTop: "1px solid var(--line)" }}
              >
                <div>
                  <div className="font-mono text-[9.5px] tracking-[0.14em] text-[color:var(--paper-4)]">
                    LOCK · {countdownShort(p.locksAt)}
                  </div>
                  {meta && (
                    <div
                      className="font-mono text-[10px] tracking-[0.1em] mt-1"
                      style={{ color: isOpen ? "var(--mexico)" : "var(--paper-4)" }}
                    >
                      MAX {meta.maxPts} PTS
                    </div>
                  )}
                </div>
                {isOpen ? (
                  <span className="btn btn-primary btn-sm">
                    {meta?.cta ?? "Continuer"} →
                  </span>
                ) : (
                  <span
                    className="font-mono text-[11px] tracking-[0.12em] inline-flex items-center gap-1.5"
                    style={{ color: "var(--paper-4)" }}
                  >
                    <LockIcon size={12} />
                    {userLocked ? "Verrouillé" : "À venir"}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function countdownShort(d: Date | string): string {
  const t = timeUntil(d);
  if (t.totalMs <= 0) return "passé";
  if (t.days > 0) return `${t.days}j ${pad2(t.hours)}h`;
  return `${pad2(t.hours)}h ${pad2(t.minutes)}m`;
}

function jLabel(d: Date | string | undefined): string {
  if (!d) return "J−?";
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return "J+" + Math.abs(days);
  if (days === 0) return "JOUR J";
  return "J−" + days;
}
