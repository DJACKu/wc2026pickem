import { and, asc, eq, inArray } from "drizzle-orm";
import {
  db,
  groupPicks,
  matchPicks,
  matches,
  resultsGroupStandings,
  scores,
  thirdPlacePicks,
  users,
} from "@/db";

/* Barème ROADMAP §3.2 :
   - Équipe qualifiée pour le R32 (peu importe la position) : +2
   - Position exacte dans le groupe (1er/2e/3e/4e)         : +3
   - Meilleur 3ème correct                                  : +2
   - Vainqueur R32  : 5
   - Vainqueur R16  : 8
   - Vainqueur QF   : 12
   - Finaliste (SF) : 18
   - Vainqueur petite finale : 10
   - Champion du monde : 30                                          */

const KO_POINTS: Record<"r32" | "r16" | "qf" | "sf", number> = {
  r32: 5,
  r16: 8,
  qf: 12,
  sf: 18,
};
const PETITE_FINALE_POINTS = 10;
const CHAMPION_POINTS = 30;

export type GroupsScoreDetails = {
  exacts: number;
  qualifications: number;
  thirdsCorrect: number;
};

export type KoScoreDetails = {
  matchPoints: Record<string, number>;
};

export async function scoreGroupsPhase(): Promise<{ processed: number }> {
  const standings = await db.select().from(resultsGroupStandings);
  if (standings.length === 0) {
    throw new Error(
      "Aucune standing de poule saisie — alimente /admin/groups d'abord.",
    );
  }
  // teamId → { finalPos, isBestThird }
  const byTeam = new Map(
    standings.map((s) => [
      s.teamId,
      { finalPos: s.finalPos, isBestThird: s.isBestThird },
    ]),
  );

  const allUsers = await db.select({ id: users.id }).from(users);
  if (allUsers.length === 0) return { processed: 0 };

  const userIds = allUsers.map((u) => u.id);
  const allGroupPicks = await db
    .select()
    .from(groupPicks)
    .where(inArray(groupPicks.userId, userIds));
  const allThirdPicks = await db
    .select()
    .from(thirdPlacePicks)
    .where(inArray(thirdPlacePicks.userId, userIds));

  const pickByUser = groupBy(allGroupPicks, (p) => p.userId);
  const thirdByUser = groupBy(allThirdPicks, (p) => p.userId);

  for (const u of allUsers) {
    let pts = 0;
    const details: GroupsScoreDetails = {
      exacts: 0,
      qualifications: 0,
      thirdsCorrect: 0,
    };
    const myPicks = pickByUser.get(u.id) ?? [];
    for (const p of myPicks) {
      const actual = byTeam.get(p.teamId);
      if (!actual) continue;
      const qualifiedToR32 =
        actual.finalPos <= 2 || (actual.finalPos === 3 && actual.isBestThird);
      if (p.predictedPos === actual.finalPos) {
        pts += 3;
        details.exacts += 1;
      }
      if (qualifiedToR32) {
        pts += 2;
        details.qualifications += 1;
      }
    }
    const myThirds = thirdByUser.get(u.id) ?? [];
    for (const t of myThirds) {
      const actual = byTeam.get(t.teamId);
      if (actual && actual.finalPos === 3 && actual.isBestThird) {
        pts += 2;
        details.thirdsCorrect += 1;
      }
    }

    await upsertScore(u.id, "groups", pts, details);
  }
  return { processed: allUsers.length };
}

export async function scoreKoPhase(
  phaseId: "r32" | "r16" | "qf" | "sf" | "final",
): Promise<{ processed: number }> {
  const finished = await db
    .select()
    .from(matches)
    .where(and(eq(matches.phaseId, phaseId), eq(matches.status, "finished")))
    .orderBy(asc(matches.kickoffAt));
  if (finished.length === 0) {
    return { processed: 0 };
  }

  // Map matchId → points awarded if predicted winner correct
  const matchValue: Record<string, number> = {};
  if (phaseId === "final") {
    // Order by kickoff: last match = champion (30 pts), others = petite finale (10 pts)
    finished.forEach((m, idx) => {
      matchValue[m.id] =
        idx === finished.length - 1 ? CHAMPION_POINTS : PETITE_FINALE_POINTS;
    });
  } else {
    const v = KO_POINTS[phaseId];
    finished.forEach((m) => {
      matchValue[m.id] = v;
    });
  }

  const allUsers = await db.select({ id: users.id }).from(users);
  if (allUsers.length === 0) return { processed: 0 };

  const matchIds = finished.map((m) => m.id);
  const allMatchPicks = await db
    .select()
    .from(matchPicks)
    .where(
      and(
        inArray(matchPicks.matchId, matchIds),
        inArray(
          matchPicks.userId,
          allUsers.map((u) => u.id),
        ),
      ),
    );
  const picksByUser = groupBy(allMatchPicks, (p) => p.userId);
  const matchById = new Map(finished.map((m) => [m.id, m]));

  for (const u of allUsers) {
    let pts = 0;
    const details: KoScoreDetails = { matchPoints: {} };
    const myPicks = picksByUser.get(u.id) ?? [];
    for (const pick of myPicks) {
      const m = matchById.get(pick.matchId);
      if (!m || !m.winnerId) continue;
      if (m.winnerId === pick.predictedWinnerId) {
        const v = matchValue[m.id] ?? 0;
        pts += v;
        details.matchPoints[m.id] = v;
      }
    }
    await upsertScore(u.id, phaseId, pts, details);
  }
  return { processed: allUsers.length };
}

export async function scoreAllPhases(): Promise<{
  groups?: number;
  r32?: number;
  r16?: number;
  qf?: number;
  sf?: number;
  final?: number;
}> {
  const out: Record<string, number> = {};
  try {
    out.groups = (await scoreGroupsPhase()).processed;
  } catch {
    /* no standings yet, skip */
  }
  for (const p of ["r32", "r16", "qf", "sf", "final"] as const) {
    out[p] = (await scoreKoPhase(p)).processed;
  }
  return out;
}

async function upsertScore(
  userId: string,
  phaseId: string,
  points: number,
  details: GroupsScoreDetails | KoScoreDetails,
) {
  await db
    .insert(scores)
    .values({ userId, phaseId, points, details })
    .onConflictDoUpdate({
      target: [scores.userId, scores.phaseId],
      set: { points, details },
    });
}

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of arr) {
    const k = key(item);
    const list = m.get(k);
    if (list) list.push(item);
    else m.set(k, [item]);
  }
  return m;
}
