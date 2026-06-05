"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import {
  db,
  groupPicks,
  phases,
  pickLocks,
  teams,
  thirdPlacePicks,
} from "@/db";

const PHASE_ID = "groups";

async function assertPickable(userId: string) {
  const [p] = await db
    .select({ locksAt: phases.locksAt })
    .from(phases)
    .where(eq(phases.id, PHASE_ID))
    .limit(1);
  if (!p) throw new Error("Phase introuvable.");
  if (new Date(p.locksAt).getTime() <= Date.now()) {
    throw new Error("La phase est déjà lockée — plus aucune modification.");
  }
  const [lock] = await db
    .select()
    .from(pickLocks)
    .where(and(eq(pickLocks.userId, userId), eq(pickLocks.phaseId, PHASE_ID)))
    .limit(1);
  if (lock) throw new Error("Tu as déjà locké tes picks de poules.");
}

const groupOrderSchema = z.object({
  groupLetter: z.string().regex(/^[A-L]$/),
  teamIds: z.array(z.string()).length(4),
});

export async function saveGroupOrder(input: z.infer<typeof groupOrderSchema>) {
  const user = await requireUser();
  const { groupLetter, teamIds } = groupOrderSchema.parse(input);

  // The 4 ids must be unique and all belong to that group.
  const unique = new Set(teamIds);
  if (unique.size !== 4) throw new Error("4 équipes uniques requises.");
  const rows = await db
    .select({ id: teams.id, groupLetter: teams.groupLetter })
    .from(teams)
    .where(inArray(teams.id, teamIds));
  if (rows.length !== 4 || rows.some((t) => t.groupLetter !== groupLetter)) {
    throw new Error("Équipe hors-groupe.");
  }

  await assertPickable(user.id);

  // Replace this user's 4 picks for the group in one round-trip.
  await db
    .delete(groupPicks)
    .where(
      and(
        eq(groupPicks.userId, user.id),
        eq(groupPicks.groupLetter, groupLetter),
      ),
    );
  await db.insert(groupPicks).values(
    teamIds.map((teamId, i) => ({
      userId: user.id,
      groupLetter,
      teamId,
      predictedPos: i + 1,
    })),
  );

  // If the user moves a team out of 3rd position, clean up its 3rd-place pick
  // so the UI stays consistent.
  const thirdTeamId = teamIds[2];
  await db
    .delete(thirdPlacePicks)
    .where(
      and(
        eq(thirdPlacePicks.userId, user.id),
        // Remove any prior 3rd pick from this group that isn't the new 3rd.
        sql`team_id in (select id from teams where group_letter = ${groupLetter} and id <> ${thirdTeamId})`,
      ),
    );

  return { ok: true as const };
}

const toggleThirdSchema = z.object({
  teamId: z.string(),
  checked: z.boolean(),
});

export async function toggleThirdPick(input: z.infer<typeof toggleThirdSchema>) {
  const user = await requireUser();
  const { teamId, checked } = toggleThirdSchema.parse(input);
  await assertPickable(user.id);

  // Validate that the team is actually one of the user's 12 predicted 3rds.
  const [own] = await db
    .select()
    .from(groupPicks)
    .where(
      and(
        eq(groupPicks.userId, user.id),
        eq(groupPicks.teamId, teamId),
        eq(groupPicks.predictedPos, 3),
      ),
    )
    .limit(1);
  if (!own) {
    throw new Error("Cette équipe n'est pas dans tes 12 troisièmes.");
  }

  if (checked) {
    const current = await db
      .select({ teamId: thirdPlacePicks.teamId })
      .from(thirdPlacePicks)
      .where(eq(thirdPlacePicks.userId, user.id));
    if (current.length >= 8) {
      throw new Error("Tu as déjà 8 meilleurs 3èmes — décoches-en un d'abord.");
    }
    await db
      .insert(thirdPlacePicks)
      .values({ userId: user.id, teamId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(thirdPlacePicks)
      .where(
        and(eq(thirdPlacePicks.userId, user.id), eq(thirdPlacePicks.teamId, teamId)),
      );
  }

  return { ok: true as const };
}

export async function unlockGroupsPhase() {
  const user = await requireUser();
  const [p] = await db
    .select({ locksAt: phases.locksAt })
    .from(phases)
    .where(eq(phases.id, PHASE_ID))
    .limit(1);
  if (!p) throw new Error("Phase introuvable.");
  if (new Date(p.locksAt).getTime() <= Date.now()) {
    throw new Error("Trop tard — la deadline serveur est passée.");
  }
  await db
    .delete(pickLocks)
    .where(and(eq(pickLocks.userId, user.id), eq(pickLocks.phaseId, PHASE_ID)));
  revalidatePath("/picks");
  revalidatePath("/picks/groups");
  return { ok: true as const };
}

export async function lockGroupsPhase() {
  const user = await requireUser();
  await assertPickable(user.id);

  const [gpCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(groupPicks)
    .where(eq(groupPicks.userId, user.id));
  if (Number(gpCount?.n ?? 0) !== 48) {
    throw new Error("Tu dois classer les 4 équipes des 12 poules avant de lock.");
  }

  const [tpCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(thirdPlacePicks)
    .where(eq(thirdPlacePicks.userId, user.id));
  if (Number(tpCount?.n ?? 0) !== 8) {
    throw new Error("Coche exactement 8 meilleurs 3èmes.");
  }

  await db
    .insert(pickLocks)
    .values({ userId: user.id, phaseId: PHASE_ID })
    .onConflictDoNothing();

  revalidatePath("/picks");
  revalidatePath("/picks/groups");
  return { ok: true as const };
}
