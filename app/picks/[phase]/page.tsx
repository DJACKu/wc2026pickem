import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import {
  getMatchesByPhase,
  getPhase,
  getUserMatchPicks,
  isUserLocked,
} from "@/lib/picks";
import { db, teams } from "@/db";
import { StatusPill } from "@/components/ui/StatusPill";
import { BracketPicker } from "./BracketPicker";

export const dynamic = "force-dynamic";

const KO_PHASES = ["r32", "r16", "qf", "sf", "final"] as const;
const KO_SET = new Set(KO_PHASES);

const PHASE_INFO: Record<
  string,
  { num: string; matches: number; pts: string; sectionLabel: string }
> = {
  r32: { num: "P.2", matches: 16, pts: "+5 pts par vainqueur correct.", sectionLabel: "16es" },
  r16: { num: "P.3", matches: 8, pts: "+8 pts par vainqueur correct.", sectionLabel: "8es" },
  qf: { num: "P.4", matches: 4, pts: "+12 pts par vainqueur correct.", sectionLabel: "Quarts" },
  sf: { num: "P.5", matches: 2, pts: "+18 pts par finaliste correct.", sectionLabel: "Demies" },
  final: { num: "P.6", matches: 2, pts: "Petite finale + +30 pts si champion exact.", sectionLabel: "Finales" },
};

export default async function KoPhasePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase: phaseId } = await params;
  if (!KO_SET.has(phaseId as (typeof KO_PHASES)[number])) notFound();

  const user = await requireUser();
  const [phase, matchList, picks, locked] = await Promise.all([
    getPhase(phaseId),
    getMatchesByPhase(phaseId),
    getUserMatchPicks(user.id, phaseId),
    isUserLocked(user.id, phaseId),
  ]);

  if (!phase) notFound();

  const teamIds = Array.from(
    new Set(
      matchList.flatMap((m) =>
        [m.homeTeamId, m.awayTeamId].filter(Boolean) as string[],
      ),
    ),
  );
  const teamRows = teamIds.length
    ? await db.select().from(teams).where(inArray(teams.id, teamIds))
    : [];
  const teamsById = Object.fromEntries(teamRows.map((t) => [t.id, t]));

  const deadlinePassed = new Date(phase.locksAt).getTime() <= Date.now();
  const picksByMatch: Record<string, string> = Object.fromEntries(
    picks.map((p) => [p.matchId, p.predictedWinnerId]),
  );

  const info = PHASE_INFO[phaseId];

  return (
    <div>
      {/* Sub-header */}
      <div
        className="px-6 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/picks"
            className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
          >
            ← PICKS
          </Link>
          <span className="font-mono text-[11px] text-[color:var(--paper-4)]">/</span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)]">
            BRACKET · {phaseId.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {KO_PHASES.map((p) => {
            const active = p === phaseId;
            return (
              <Link
                key={p}
                href={`/picks/${p}`}
                className="font-mono text-[11px] tracking-[0.12em] px-2.5 py-1.5 rounded-[4px]"
                style={{
                  background: active ? "var(--paper-1)" : "transparent",
                  color: active ? "var(--ink-1)" : "var(--paper-3)",
                  border: active
                    ? "1px solid var(--paper-1)"
                    : "1px solid var(--line)",
                }}
              >
                {p.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>

      <BracketPicker
        phaseId={phaseId}
        labelFr={phase.labelFr}
        info={info}
        matches={matchList.map((m) => ({
          id: m.id,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          kickoffAt: m.kickoffAt ? m.kickoffAt.toISOString() : null,
        }))}
        teamsById={teamsById}
        initialPicks={picksByMatch}
        deadlinePassed={deadlinePassed}
        userLocked={locked}
        deadline={phase.locksAt.toISOString()}
      />
    </div>
  );
}
