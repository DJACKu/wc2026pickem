import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  groupPicks,
  matchPicks,
  matches,
  phases,
  pickLocks,
  teams,
  thirdPlacePicks,
} from "@/db";

export async function getPhase(phaseId: string) {
  const [p] = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
  return p ?? null;
}

export async function isPhaseLocked(phaseId: string): Promise<boolean> {
  const p = await getPhase(phaseId);
  if (!p) return true;
  // If phase is groups, we rely on per-group kickoff times instead of the global lock.
  if (phaseId === "groups") return false;
  return new Date(p.locksAt).getTime() <= Date.now();
}

export async function getStartedGroups(): Promise<Set<string>> {
  const now = new Date();
  const rows = await db
    .select({ groupLetter: teams.groupLetter })
    .from(matches)
    .innerJoin(teams, eq(matches.homeTeamId, teams.id))
    .where(
      and(
        eq(matches.phaseId, "groups"),
        // @ts-ignore
        sql`${matches.kickoffAt} <= ${now.toISOString()}`
      )
    )
    .groupBy(teams.groupLetter);
  return new Set(rows.map((r) => r.groupLetter!));
}

export async function isUserLocked(userId: string, phaseId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: pickLocks.userId })
    .from(pickLocks)
    .where(and(eq(pickLocks.userId, userId), eq(pickLocks.phaseId, phaseId)))
    .limit(1);
  return !!row;
}

export async function getUserGroupPicks(userId: string) {
  return db
    .select({
      groupLetter: groupPicks.groupLetter,
      teamId: groupPicks.teamId,
      predictedPos: groupPicks.predictedPos,
    })
    .from(groupPicks)
    .where(eq(groupPicks.userId, userId));
}

export async function getUserThirdPicks(userId: string): Promise<string[]> {
  const rows = await db
    .select({ teamId: thirdPlacePicks.teamId })
    .from(thirdPlacePicks)
    .where(eq(thirdPlacePicks.userId, userId));
  return rows.map((r) => r.teamId);
}

export async function getUserMatchPicks(userId: string, phaseId: string) {
  return db
    .select({
      matchId: matchPicks.matchId,
      predictedWinnerId: matchPicks.predictedWinnerId,
    })
    .from(matchPicks)
    .innerJoin(matches, eq(matches.id, matchPicks.matchId))
    .where(and(eq(matchPicks.userId, userId), eq(matches.phaseId, phaseId)));
}

export async function getAllTeams() {
  return db.select().from(teams).orderBy(asc(teams.groupLetter), asc(teams.nameFr));
}

export async function getTeamsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(teams).where(inArray(teams.id, ids));
}

export async function getMatchesByPhase(phaseId: string) {
  return db
    .select()
    .from(matches)
    .where(eq(matches.phaseId, phaseId))
    .orderBy(asc(matches.kickoffAt));
}
