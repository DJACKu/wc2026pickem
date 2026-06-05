import { asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  db,
  friendGroupMembers,
  pickLocks,
  scores,
  users,
} from "@/db";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  total: number;
  groupsPts: number;
  thirdsBonus: number;
  isMe: boolean;
  isLocked: boolean;
};

const PAGE_SIZE = 25;

export async function getLeaderboardPage({
  search,
  page,
  meId,
}: {
  search?: string;
  page: number;
  meId?: string;
}): Promise<{ rows: LeaderboardRow[]; total: number; pageSize: number }> {
  const where = search ? ilike(users.handle, `%${search}%`) : undefined;

  const totalRow = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(users)
    .where(where);
  const total = Number(totalRow[0]?.n ?? 0);

  const baseRows = await db
    .select({
      userId: users.id,
      handle: users.handle,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      total: sql<number>`COALESCE(SUM(${scores.points}), 0)::int`,
    })
    .from(users)
    .leftJoin(scores, eq(scores.userId, users.id))
    .where(where)
    .groupBy(users.id)
    .orderBy(desc(sql`COALESCE(SUM(${scores.points}), 0)`), asc(users.handle))
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);

  if (baseRows.length === 0) {
    return { rows: [], total, pageSize: PAGE_SIZE };
  }

  const userIds = baseRows.map((r) => r.userId);

  // Groups (poules) sub-score
  const groupsScores = await db
    .select({
      userId: scores.userId,
      pts: sql<number>`COALESCE(${scores.points}, 0)::int`,
    })
    .from(scores)
    .where(sql`${scores.phaseId} = 'groups' AND ${scores.userId} IN ${userIds}`);
  const groupsByUser = new Map(
    groupsScores.map((r) => [r.userId, Number(r.pts)]),
  );

  // Best-3rds bonus is encoded inside scores.details — for MVP just use 0 as placeholder.
  // We'll fill it from details JSONB when scoring is implemented (Bloc 4).
  const lockedRows = await db
    .select({ userId: pickLocks.userId })
    .from(pickLocks)
    .where(
      sql`${pickLocks.phaseId} = 'groups' AND ${pickLocks.userId} IN ${userIds}`,
    );
  const lockedSet = new Set(lockedRows.map((r) => r.userId));

  const baseRank = page * PAGE_SIZE;

  return {
    rows: baseRows.map((r, idx) => ({
      rank: baseRank + idx + 1,
      userId: r.userId,
      handle: r.handle,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      total: Number(r.total),
      groupsPts: groupsByUser.get(r.userId) ?? 0,
      thirdsBonus: 0,
      isMe: meId === r.userId,
      isLocked: lockedSet.has(r.userId),
    })),
    total,
    pageSize: PAGE_SIZE,
  };
}

export async function getMyFriendGroupsSummary(userId: string) {
  const rows = await db
    .select({
      groupId: friendGroupMembers.groupId,
    })
    .from(friendGroupMembers)
    .where(eq(friendGroupMembers.userId, userId));
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.groupId);
  const memberCounts = await db
    .select({
      groupId: friendGroupMembers.groupId,
      n: sql<number>`count(*)::int`,
    })
    .from(friendGroupMembers)
    .where(inArray(friendGroupMembers.groupId, ids))
    .groupBy(friendGroupMembers.groupId);
  return memberCounts.map((c) => ({ groupId: c.groupId, n: Number(c.n) }));
}
