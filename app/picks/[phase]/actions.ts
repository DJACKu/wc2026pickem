"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db, matchPicks, matches, phases, pickLocks } from "@/db";

const KO_PHASES = ["r32", "r16", "qf", "sf", "final"] as const;
const phaseIdSchema = z.enum(KO_PHASES);

async function assertPickable(userId: string, phaseId: string) {
  const [p] = await db
    .select({ locksAt: phases.locksAt })
    .from(phases)
    .where(eq(phases.id, phaseId))
    .limit(1);
  if (!p) throw new Error("Phase introuvable.");
  if (new Date(p.locksAt).getTime() <= Date.now()) {
    throw new Error("La phase est déjà lockée.");
  }
  const [lock] = await db
    .select()
    .from(pickLocks)
    .where(and(eq(pickLocks.userId, userId), eq(pickLocks.phaseId, phaseId)))
    .limit(1);
  if (lock) throw new Error("Tu as déjà locké cette phase.");
}

const saveSchema = z.object({
  phaseId: phaseIdSchema,
  matchId: z.string(),
  winnerId: z.string(),
});

export async function saveMatchPick(input: z.infer<typeof saveSchema>) {
  const user = await requireUser();
  const { phaseId, matchId, winnerId } = saveSchema.parse(input);

  // Match must belong to phase and winnerId must be one of its teams.
  const [m] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);
  if (!m || m.phaseId !== phaseId) throw new Error("Match introuvable.");
  if (m.homeTeamId !== winnerId && m.awayTeamId !== winnerId) {
    throw new Error("Équipe non valide pour ce match.");
  }

  await assertPickable(user.id, phaseId);

  await db
    .insert(matchPicks)
    .values({ userId: user.id, matchId, predictedWinnerId: winnerId })
    .onConflictDoUpdate({
      target: [matchPicks.userId, matchPicks.matchId],
      set: { predictedWinnerId: winnerId },
    });

  return { ok: true as const };
}

const lockSchema = z.object({ phaseId: phaseIdSchema });

export async function unlockKoPhase(input: z.infer<typeof lockSchema>) {
  const user = await requireUser();
  const { phaseId } = lockSchema.parse(input);
  const [p] = await db
    .select({ locksAt: phases.locksAt })
    .from(phases)
    .where(eq(phases.id, phaseId))
    .limit(1);
  if (!p) throw new Error("Phase introuvable.");
  if (new Date(p.locksAt).getTime() <= Date.now()) {
    throw new Error("Trop tard — la deadline serveur est passée.");
  }
  await db
    .delete(pickLocks)
    .where(and(eq(pickLocks.userId, user.id), eq(pickLocks.phaseId, phaseId)));
  revalidatePath("/picks");
  revalidatePath(`/picks/${phaseId}`);
  return { ok: true as const };
}

export async function lockKoPhase(input: z.infer<typeof lockSchema>) {
  const user = await requireUser();
  const { phaseId } = lockSchema.parse(input);
  await assertPickable(user.id, phaseId);

  const [totals] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(matches)
    .where(eq(matches.phaseId, phaseId));
  const total = Number(totals?.n ?? 0);
  if (total === 0) {
    throw new Error("Aucune affiche n'est encore connue pour cette phase.");
  }

  const [picked] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(matchPicks)
    .innerJoin(matches, eq(matches.id, matchPicks.matchId))
    .where(and(eq(matchPicks.userId, user.id), eq(matches.phaseId, phaseId)));
  if (Number(picked?.n ?? 0) !== total) {
    throw new Error(`Il manque ${total - Number(picked?.n ?? 0)} pick(s).`);
  }

  await db
    .insert(pickLocks)
    .values({ userId: user.id, phaseId })
    .onConflictDoNothing();

  revalidatePath("/picks");
  revalidatePath(`/picks/${phaseId}`);
  return { ok: true as const };
}
