import { asc, eq, sql } from "drizzle-orm";
import {
  db,
  groupPicks,
  matchPicks,
  matches,
  phases,
  pickLocks,
  scores,
  teams,
  thirdPlacePicks,
  users,
} from "@/db";

export async function getUserByHandle(handle: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.handle, handle))
    .limit(1);
  return row ?? null;
}

export async function getUserPhaseScores(userId: string) {
  const phaseRows = await db.select().from(phases).orderBy(asc(phases.sortOrder));
  const scoreRows = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, userId));
  const byPhase = new Map(scoreRows.map((s) => [s.phaseId, s.points]));
  return phaseRows.map((p) => ({
    id: p.id,
    labelFr: p.labelFr,
    points: byPhase.get(p.id) ?? 0,
    status: p.status,
    locksAt: p.locksAt,
  }));
}

export async function getUserGroupTopPicks(userId: string) {
  // The user's predicted 1st-place per group, with team meta + (optionally) correctness.
  const rows = await db
    .select({
      groupLetter: groupPicks.groupLetter,
      teamId: groupPicks.teamId,
      teamNameFr: teams.nameFr,
      teamFlag: teams.flagEmoji,
    })
    .from(groupPicks)
    .innerJoin(teams, eq(teams.id, groupPicks.teamId))
    .where(
      sql`${groupPicks.userId} = ${userId} AND ${groupPicks.predictedPos} = 1`,
    )
    .orderBy(asc(groupPicks.groupLetter));
  return rows;
}

export async function isGroupsPhaseRevealed(): Promise<boolean> {
  const [p] = await db
    .select({ locksAt: phases.locksAt })
    .from(phases)
    .where(eq(phases.id, "groups"))
    .limit(1);
  if (!p) return false;
  return new Date(p.locksAt).getTime() <= Date.now();
}

export async function getUserMembershipSummary(userId: string) {
  const [c] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(pickLocks)
    .where(eq(pickLocks.userId, userId));
  return { phasesLocked: Number(c?.n ?? 0) };
}

export type Badges = {
  firstLocked: boolean; // Lock groupes > 24h avant la deadline
  madameIrma: boolean; // ≥9/12 tops de groupes exacts
  troisiemeOeil: boolean; // ≥6/8 meilleurs 3èmes corrects
  royaume: boolean; // Champion du monde prédit correctement
};

export async function getUserBadges(userId: string): Promise<Badges> {
  // Premier locké : lecture conjointe phases.locks_at (groups) et pick_locks.locked_at
  const [groupsPhase, lockRow, groupsScore, finalScore] = await Promise.all([
    db
      .select({ locksAt: phases.locksAt })
      .from(phases)
      .where(eq(phases.id, "groups"))
      .limit(1)
      .then((r) => r[0]),
    db
      .select({ lockedAt: pickLocks.lockedAt })
      .from(pickLocks)
      .where(sql`${pickLocks.userId} = ${userId} AND ${pickLocks.phaseId} = 'groups'`)
      .limit(1)
      .then((r) => r[0]),
    db
      .select({ details: scores.details })
      .from(scores)
      .where(sql`${scores.userId} = ${userId} AND ${scores.phaseId} = 'groups'`)
      .limit(1)
      .then((r) => r[0]),
    db
      .select({ details: scores.details })
      .from(scores)
      .where(sql`${scores.userId} = ${userId} AND ${scores.phaseId} = 'final'`)
      .limit(1)
      .then((r) => r[0]),
  ]);

  const firstLocked = !!(
    groupsPhase &&
    lockRow &&
    new Date(lockRow.lockedAt).getTime() <=
      new Date(groupsPhase.locksAt).getTime() - 24 * 3600 * 1000
  );

  type GroupsDetails = { exacts?: number; thirdsCorrect?: number };
  const gd = (groupsScore?.details ?? {}) as GroupsDetails;
  const madameIrma = (gd.exacts ?? 0) >= 9;
  const troisiemeOeil = (gd.thirdsCorrect ?? 0) >= 6;

  type FinalDetails = { matchPoints?: Record<string, number> };
  const fd = (finalScore?.details ?? {}) as FinalDetails;
  const royaume = Object.values(fd.matchPoints ?? {}).some((v) => v >= 30);

  return { firstLocked, madameIrma, troisiemeOeil, royaume };
}
