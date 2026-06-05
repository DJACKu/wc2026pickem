import { randomBytes } from "crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, friendGroupMembers, friendGroups, scores, users } from "@/db";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  const bytes = randomBytes(4);
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return `WC26-${suffix}`;
}

export async function getFriendGroupByCode(code: string) {
  const [row] = await db
    .select()
    .from(friendGroups)
    .where(eq(friendGroups.inviteCode, code))
    .limit(1);
  return row ?? null;
}

export async function getFriendGroupById(id: string) {
  const [row] = await db
    .select()
    .from(friendGroups)
    .where(eq(friendGroups.id, id))
    .limit(1);
  return row ?? null;
}

export type FriendGroupSummary = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  memberCount: number;
};

export async function getUserFriendGroups(
  userId: string,
): Promise<FriendGroupSummary[]> {
  const memberships = await db
    .select({ groupId: friendGroupMembers.groupId })
    .from(friendGroupMembers)
    .where(eq(friendGroupMembers.userId, userId));
  if (memberships.length === 0) return [];

  const ids = memberships.map((m) => m.groupId);
  const groupsRows = await db
    .select({
      id: friendGroups.id,
      name: friendGroups.name,
      inviteCode: friendGroups.inviteCode,
      ownerId: friendGroups.ownerId,
      memberCount: sql<number>`count(${friendGroupMembers.userId})::int`,
    })
    .from(friendGroups)
    .leftJoin(
      friendGroupMembers,
      eq(friendGroupMembers.groupId, friendGroups.id),
    )
    .where(sql`${friendGroups.id} IN ${ids}`)
    .groupBy(friendGroups.id)
    .orderBy(asc(friendGroups.name));

  return groupsRows.map((r) => ({
    ...r,
    memberCount: Number(r.memberCount),
  }));
}

export type GroupMemberRow = {
  rank: number;
  userId: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  total: number;
  isMe: boolean;
  isOwner: boolean;
  joinedAt: Date;
};

export async function getFriendGroupMembersWithScores(
  groupId: string,
  meId?: string,
): Promise<{
  group: { id: string; name: string; inviteCode: string; ownerId: string };
  members: GroupMemberRow[];
} | null> {
  const group = await getFriendGroupById(groupId);
  if (!group) return null;

  const rows = await db
    .select({
      userId: users.id,
      handle: users.handle,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      joinedAt: friendGroupMembers.joinedAt,
      total: sql<number>`COALESCE(SUM(${scores.points}), 0)::int`,
    })
    .from(friendGroupMembers)
    .innerJoin(users, eq(users.id, friendGroupMembers.userId))
    .leftJoin(scores, eq(scores.userId, users.id))
    .where(eq(friendGroupMembers.groupId, groupId))
    .groupBy(users.id, friendGroupMembers.joinedAt)
    .orderBy(desc(sql`COALESCE(SUM(${scores.points}), 0)`), asc(users.handle));

  return {
    group,
    members: rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      handle: r.handle,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      total: Number(r.total),
      isMe: meId === r.userId,
      isOwner: group.ownerId === r.userId,
      joinedAt: new Date(r.joinedAt),
    })),
  };
}

export async function isMember(groupId: string, userId: string) {
  const [row] = await db
    .select()
    .from(friendGroupMembers)
    .where(
      and(
        eq(friendGroupMembers.groupId, groupId),
        eq(friendGroupMembers.userId, userId),
      ),
    )
    .limit(1);
  return !!row;
}
