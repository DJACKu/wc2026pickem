import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import {
  getMatchesByPhase,
  getPhase,
  getUserAllMatchPicks,
} from "@/lib/picks";
import { db, teams, phases, matches, pickLocks } from "@/db";
import { inArray, asc, eq } from "drizzle-orm";
import { BracketTreePicker } from "./BracketTreePicker";

export const dynamic = "force-dynamic";

const KO_PHASES = ["r32", "r16", "qf", "sf", "final"] as const;

export default async function BracketHubPage() {
  const user = await requireUser();

  const [
    allTeams,
    koPhasesList,
    koMatches,
    matchPicks,
    lockedRows,
  ] = await Promise.all([
    db.select().from(teams),
    db.select().from(phases).where(inArray(phases.id, KO_PHASES)).orderBy(asc(phases.sortOrder)),
    db.select().from(matches).where(inArray(matches.phaseId, KO_PHASES)).orderBy(asc(matches.kickoffAt)),
    getUserAllMatchPicks(user.id),
    db.select({ phaseId: pickLocks.phaseId }).from(pickLocks).where(eq(pickLocks.userId, user.id)),
  ]);

  const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t]));

  const koMatchesByPhase: Record<string, typeof koMatches> = {};
  for (const m of koMatches) {
    (koMatchesByPhase[m.phaseId] ??= []).push(m);
  }

  const koPicksByPhase: Record<string, Record<string, string>> = {};
  for (const p of matchPicks) {
    if (!koPicksByPhase[p.phaseId]) koPicksByPhase[p.phaseId] = {};
    koPicksByPhase[p.phaseId][p.matchId] = p.predictedWinnerId!;
  }

  const userLockedPhases: Record<string, boolean> = {};
  for (const r of lockedRows) {
    userLockedPhases[r.phaseId] = true;
  }

  const readOnlyPhases: Record<string, boolean> = {};
  for (const p of koPhasesList) {
    const deadlinePassed = new Date(p.locksAt).getTime() <= Date.now();
    const notOpenedYet = new Date(p.opensAt).getTime() > Date.now();
    readOnlyPhases[p.id] = deadlinePassed || notOpenedYet || userLockedPhases[p.id];
  }

  return (
    <div>
      {/* Sub-header */}
      <div
        className="px-6 lg:px-10 py-4 flex items-center gap-4 flex-wrap"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <Link
          href="/picks"
          className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
        >
          ← PICKS
        </Link>
        <span className="font-mono text-[11px] text-[color:var(--paper-4)]">/</span>
        <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)]">
          BRACKET COMPLET
        </span>
      </div>

      <div className="px-6 lg:px-10 py-8">
        <BracketTreePicker
          teamsById={teamsById}
          koPhases={koPhasesList}
          koMatchesByPhase={koMatchesByPhase}
          initialPicksByPhase={koPicksByPhase}
          readOnlyPhases={readOnlyPhases}
          userLockedPhases={userLockedPhases}
        />
      </div>
    </div>
  );
}
