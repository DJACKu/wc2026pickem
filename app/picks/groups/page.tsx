import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import {
  getAllTeams,
  getPhase,
  getUserGroupPicks,
  getUserThirdPicks,
  isUserLocked,
  getStartedGroups,
  getMatchesByPhase,
} from "@/lib/picks";
import { GROUP_LETTERS } from "@/db/seed-data";
import { GroupsPicker } from "./GroupsPicker";

export const dynamic = "force-dynamic";

export default async function GroupsPicksPage() {
  const user = await requireUser();
  const [phase, teams, picks, thirds, locked, startedSet, allMatches] = await Promise.all([
    getPhase("groups"),
    getAllTeams(),
    getUserGroupPicks(user.id),
    getUserThirdPicks(user.id),
    isUserLocked(user.id, "groups"),
    getStartedGroups(),
    getMatchesByPhase("groups"),
  ]);

  if (!phase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-[color:var(--paper-3)]">Phase introuvable.</p>
      </div>
    );
  }

  const deadlinePassed = new Date(phase.locksAt).getTime() <= Date.now();

  const teamsByGroup: Record<string, typeof teams> = {};
  for (const l of GROUP_LETTERS) teamsByGroup[l] = [];
  for (const t of teams) teamsByGroup[t.groupLetter]?.push(t);

  const pickedByGroup: Record<string, Array<{ teamId: string; predictedPos: number }>> = {};
  for (const p of picks) {
    (pickedByGroup[p.groupLetter] ??= []).push(p);
  }

  const initialOrders: Record<string, string[]> = {};
  for (const l of GROUP_LETTERS) {
    const groupTeams = teamsByGroup[l] ?? [];
    const userPicks = (pickedByGroup[l] ?? []).sort(
      (a, b) => a.predictedPos - b.predictedPos,
    );
    if (userPicks.length === 4) {
      initialOrders[l] = userPicks.map((p) => p.teamId);
    } else {
      initialOrders[l] = groupTeams.map((t) => t.id);
    }
  }

  const savedGroupsCount = Object.keys(pickedByGroup).filter(
    (l) => (pickedByGroup[l]?.length ?? 0) === 4,
  ).length;

  const matchesByGroup: Record<string, typeof allMatches> = {};
  for (const m of allMatches) {
    // Find the group of the home team
    const t = teams.find((x) => x.id === m.homeTeamId);
    if (t) {
      (matchesByGroup[t.groupLetter] ??= []).push(m);
    }
  }

  return (
    <div>
      {/* Sub-header strip */}
      <div
        className="px-6 lg:px-10 py-4 flex items-center justify-between gap-4"
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
            PHASE 1 — POULES
          </span>
        </div>
      </div>

      <GroupsPicker
        teamsById={Object.fromEntries(teams.map((t) => [t.id, t]))}
        initialOrders={initialOrders}
        initialThirds={thirds}
        deadlinePassed={deadlinePassed}
        deadline={phase.locksAt.toISOString()}
        userLocked={locked}
        initialSavedGroupsCount={savedGroupsCount}
        startedGroups={Array.from(startedSet)}
        matchesByGroup={matchesByGroup}
      />
    </div>
  );
}
