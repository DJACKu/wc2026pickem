"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  db,
  matchStatusEnum,
  matches,
  phaseStatusEnum,
  phases,
  resultsGroupStandings,
  teams,
} from "@/db";
import {
  scoreAllPhases,
  scoreGroupsPhase,
  scoreKoPhase,
} from "@/lib/scoring";

const PHASE_IDS = ["groups", "r32", "r16", "qf", "sf", "final"] as const;
const KO_IDS = ["r32", "r16", "qf", "sf", "final"] as const;
const GROUP_LETTERS = [
  "A","B","C","D","E","F","G","H","I","J","K","L",
] as const;

/* ============================================================
   Phases — status + dates
============================================================ */

const phaseUpdateSchema = z.object({
  phaseId: z.enum(PHASE_IDS),
  status: z.enum(phaseStatusEnum.enumValues),
  locksAt: z.string(),
});

export async function updatePhase(formData: FormData) {
  await requireAdmin();
  const input = phaseUpdateSchema.parse({
    phaseId: formData.get("phaseId"),
    status: formData.get("status"),
    locksAt: formData.get("locksAt"),
  });
  const d = new Date(input.locksAt);
  if (isNaN(d.getTime())) throw new Error("Date invalide.");
  await db
    .update(phases)
    .set({ status: input.status, locksAt: d })
    .where(eq(phases.id, input.phaseId));
  revalidatePath("/admin");
  revalidatePath("/picks");
}

/* ============================================================
   Standings des poules — saisie des 4 positions + best-thirds
============================================================ */

const groupStandingSchema = z.object({
  groupLetter: z.enum(GROUP_LETTERS),
  pos1: z.string().min(1),
  pos2: z.string().min(1),
  pos3: z.string().min(1),
  pos4: z.string().min(1),
  pos3IsBestThird: z.string().optional(), // checkbox "on" or absent
});

export async function saveGroupStanding(formData: FormData) {
  await requireAdmin();
  const data = groupStandingSchema.parse({
    groupLetter: formData.get("groupLetter"),
    pos1: formData.get("pos1"),
    pos2: formData.get("pos2"),
    pos3: formData.get("pos3"),
    pos4: formData.get("pos4"),
    pos3IsBestThird: formData.get("pos3IsBestThird") ?? undefined,
  });

  const teams = [data.pos1, data.pos2, data.pos3, data.pos4];
  if (new Set(teams).size !== 4) {
    throw new Error("Les 4 équipes doivent être distinctes.");
  }
  const isBest = !!data.pos3IsBestThird;

  // Wipe then insert this group's 4 rows.
  await db
    .delete(resultsGroupStandings)
    .where(eq(resultsGroupStandings.groupLetter, data.groupLetter));
  await db.insert(resultsGroupStandings).values([
    { groupLetter: data.groupLetter, teamId: data.pos1, finalPos: 1, isBestThird: false },
    { groupLetter: data.groupLetter, teamId: data.pos2, finalPos: 2, isBestThird: false },
    { groupLetter: data.groupLetter, teamId: data.pos3, finalPos: 3, isBestThird: isBest },
    { groupLetter: data.groupLetter, teamId: data.pos4, finalPos: 4, isBestThird: false },
  ]);

  revalidatePath("/admin/standings");
}

/* ============================================================
   KO matches — CRUD minimal
============================================================ */

const createMatchSchema = z.object({
  matchId: z.string().min(1).max(40),
  phaseId: z.enum(KO_IDS),
  homeTeamId: z.string().min(2),
  awayTeamId: z.string().min(2),
  kickoffAt: z.string().min(1),
});

export async function createMatch(formData: FormData) {
  await requireAdmin();
  const data = createMatchSchema.parse({
    matchId: formData.get("matchId"),
    phaseId: formData.get("phaseId"),
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    kickoffAt: formData.get("kickoffAt"),
  });
  if (data.homeTeamId === data.awayTeamId) {
    throw new Error("Les deux équipes doivent être différentes.");
  }
  await db
    .insert(matches)
    .values({
      id: data.matchId,
      phaseId: data.phaseId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      kickoffAt: new Date(data.kickoffAt),
      status: "scheduled",
    })
    .onConflictDoUpdate({
      target: matches.id,
      set: {
        phaseId: data.phaseId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        kickoffAt: new Date(data.kickoffAt),
      },
    });
  revalidatePath("/admin/matches");
  revalidatePath(`/picks/${data.phaseId}`);
}

const resultSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.string(),
  awayScore: z.string(),
  winnerId: z.string().min(2),
  status: z.enum(matchStatusEnum.enumValues).default("finished"),
});

export async function setMatchResult(formData: FormData) {
  await requireAdmin();
  const data = resultSchema.parse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore") ?? "0",
    awayScore: formData.get("awayScore") ?? "0",
    winnerId: formData.get("winnerId"),
    status: formData.get("status") ?? "finished",
  });
  const hs = Number(data.homeScore);
  const as = Number(data.awayScore);
  if (!Number.isFinite(hs) || !Number.isFinite(as)) {
    throw new Error("Scores invalides.");
  }
  const [m] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, data.matchId))
    .limit(1);
  if (!m) throw new Error("Match introuvable.");
  if (m.homeTeamId !== data.winnerId && m.awayTeamId !== data.winnerId) {
    throw new Error("Le vainqueur doit être l'une des deux équipes du match.");
  }
  await db
    .update(matches)
    .set({
      homeScore: hs,
      awayScore: as,
      winnerId: data.winnerId,
      status: data.status,
      manualOverride: true,
    })
    .where(eq(matches.id, data.matchId));
  revalidatePath("/admin/matches");
}

export async function deleteMatch(formData: FormData) {
  await requireAdmin();
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) throw new Error("matchId manquant.");
  await db.delete(matches).where(eq(matches.id, matchId));
  revalidatePath("/admin/matches");
}

const setTeamsSchema = z.object({
  matchId: z.string().min(1),
  homeTeamId: z.string().min(2),
  awayTeamId: z.string().min(2),
  kickoffAt: z.string().min(1),
});

export async function setMatchTeams(formData: FormData) {
  await requireAdmin();
  const data = setTeamsSchema.parse({
    matchId: formData.get("matchId"),
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    kickoffAt: formData.get("kickoffAt"),
  });
  if (data.homeTeamId === data.awayTeamId) {
    throw new Error("Les deux équipes doivent être différentes.");
  }
  const d = new Date(data.kickoffAt);
  if (isNaN(d.getTime())) throw new Error("Date invalide.");
  await db
    .update(matches)
    .set({
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      kickoffAt: d,
    })
    .where(eq(matches.id, data.matchId));
  revalidatePath("/admin/matches");
}

/* Sync depuis football-data.org : pull tout le bracket KO en une fois et
   upsert dans `matches`. Respecte `manual_override` : si tu as déjà saisi
   une affiche à la main, elle n'est pas écrasée. Idempotent — relançable. */

type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam?: { tla?: string | null; shortName?: string | null };
  awayTeam?: { tla?: string | null; shortName?: string | null };
  score?: {
    fullTime?: { home: number | null; away: number | null };
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  };
};

const FD_STAGE_TO_PHASE: Record<string, "groups" | "r32" | "r16" | "qf" | "sf" | "final"> = {
  GROUP_STAGE: "groups",
  LAST_32: "r32",
  ROUND_OF_32: "r32",
  LAST_16: "r16",
  ROUND_OF_16: "r16",
  QUARTER_FINALS: "qf",
  QUARTER_FINAL: "qf",
  SEMI_FINALS: "sf",
  SEMI_FINAL: "sf",
  THIRD_PLACE: "final",
  THIRD_PLACE_PLAY_OFF: "final",
  FINAL: "final",
};

export async function syncBracketFromFootballData() {
  await requireAdmin();
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    throw new Error(
      "FOOTBALL_DATA_TOKEN absent — ajoute la clé dans Vercel → Settings → Environment Variables.",
    );
  }

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches",
    {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(
      `football-data API ${res.status} — ${await res.text().catch(() => "")}`,
    );
  }
  const payload = (await res.json()) as { matches?: FdMatch[] };
  const incoming = payload.matches ?? [];

  const ourTeams = new Set(
    (await db.select({ id: teams.id }).from(teams)).map((t) => t.id),
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let teamLookupMisses = 0;

  // football-data.org sometimes uses different TLAs than FIFA codes
  const TLA_ALIASES: Record<string, string> = {
    CUR: "CUW",   // Curaçao
    CAP: "CPV",   // Cap-Vert
    SAU: "KSA",   // Arabie Saoudite
    CRC: "CRI",   // Costa Rica (if present)
    RSA: "RSA",   // South Africa (same)
    SCT: "SCO",   // Scotland
    ALG: "ALG",   // Algeria (same)
    BOS: "BIH",   // Bosnia
    PAR: "PAR",   // Paraguay (same)
  };

  function resolveTla(tla: string | null): string | null {
    if (!tla) return null;
    const upper = tla.toUpperCase();
    const mapped = TLA_ALIASES[upper] ?? upper;
    return ourTeams.has(mapped) ? mapped : (ourTeams.has(upper) ? upper : null);
  }

  for (const fd of incoming) {
    const phaseId = FD_STAGE_TO_PHASE[fd.stage];
    if (!phaseId) continue; // unknown stage, skip

    const matchId = `fd-${fd.id}`;

    const homeTla = fd.homeTeam?.tla?.toUpperCase() ?? null;
    const awayTla = fd.awayTeam?.tla?.toUpperCase() ?? null;
    const homeId = resolveTla(homeTla);
    const awayId = resolveTla(awayTla);
    if (homeTla && !homeId) { teamLookupMisses++; console.warn(`[sync] Unknown home TLA: ${homeTla}`); }
    if (awayTla && !awayId) { teamLookupMisses++; console.warn(`[sync] Unknown away TLA: ${awayTla}`); }

    const kickoff = fd.utcDate ? new Date(fd.utcDate) : null;

    const winnerHome = fd.score?.winner === "HOME_TEAM";
    const winnerAway = fd.score?.winner === "AWAY_TEAM";
    const winnerId = winnerHome ? homeId : winnerAway ? awayId : null;
    const status: "scheduled" | "live" | "finished" =
      fd.status === "FINISHED"
        ? "finished"
        : fd.status === "IN_PLAY" || fd.status === "PAUSED"
          ? "live"
          : "scheduled";

    const [existing] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (existing) {
      if (existing.manualOverride) {
        skipped++;
        continue;
      }
      await db
        .update(matches)
        .set({
          phaseId,
          homeTeamId: homeId,
          awayTeamId: awayId,
          kickoffAt: kickoff,
          homeScore: fd.score?.fullTime?.home ?? null,
          awayScore: fd.score?.fullTime?.away ?? null,
          winnerId,
          status,
        })
        .where(eq(matches.id, matchId));
      updated++;
    } else {
      await db.insert(matches).values({
        id: matchId,
        phaseId,
        homeTeamId: homeId,
        awayTeamId: awayId,
        kickoffAt: kickoff,
        homeScore: fd.score?.fullTime?.home ?? null,
        awayScore: fd.score?.fullTime?.away ?? null,
        winnerId,
        status,
      });
      created++;
    }
  }

  console.log(
    `[syncBracketFromFootballData] created=${created} updated=${updated} skipped=${skipped} teamMisses=${teamLookupMisses}`,
  );

  revalidatePath("/admin/matches");
  revalidatePath("/today");
  revalidatePath("/picks/groups");
  revalidatePath("/picks/r32");
  revalidatePath("/picks/r16");
  revalidatePath("/picks/qf");
  revalidatePath("/picks/sf");
  revalidatePath("/picks/final");
}

/* Bootstrap R32 : crée 16 affiches vides avec dates étalées sur 28 juin
   → 3 juillet 2026 (en UTC, horaires placeholder). L'admin remplira ensuite
   les équipes via le bouton « Modifier » de chaque ligne, selon le tableau
   FIFA officiel des pairings groupes → R32. */
export async function bootstrapR32() {
  await requireAdmin();
  // 3 matchs/jour sur 6 jours (28 juin → 3 juillet)
  const days = [
    "2026-06-28",
    "2026-06-29",
    "2026-06-30",
    "2026-07-01",
    "2026-07-02",
    "2026-07-03",
  ];
  // Horaires UTC (équivalents 18h, 20h, 22h CET) — éditables ensuite
  const slots = ["17:00:00Z", "19:00:00Z", "21:00:00Z"];
  let i = 0;
  for (let d = 0; d < days.length && i < 16; d++) {
    for (let s = 0; s < slots.length && i < 16; s++) {
      const id = `r32-${String(i + 1).padStart(2, "0")}`;
      const kickoff = new Date(`${days[d]}T${slots[s]}`);
      await db
        .insert(matches)
        .values({
          id,
          phaseId: "r32",
          kickoffAt: kickoff,
          status: "scheduled",
        })
        .onConflictDoNothing();
      i++;
    }
  }
  revalidatePath("/admin/matches");
  revalidatePath("/picks/r32");
}

/* ============================================================
   Auto-fill — génère les affiches de la phase suivante à partir
   des vainqueurs de la précédente. Marche pour R32 → R16 → QF
   → SF → Final. Le mapping groupes → R32 reste manuel (dépend du
   tirage FIFA officiel).
============================================================ */

const AUTOFILL_PHASES = ["r16", "qf", "sf", "final"] as const;
const autoFillSchema = z.object({ phaseId: z.enum(AUTOFILL_PHASES) });

const PREV_PHASE: Record<(typeof AUTOFILL_PHASES)[number], "r32" | "r16" | "qf" | "sf"> = {
  r16: "r32",
  qf: "r16",
  sf: "qf",
  final: "sf",
};

const EXPECTED_PREV_COUNT: Record<(typeof AUTOFILL_PHASES)[number], number> = {
  r16: 16,
  qf: 8,
  sf: 4,
  final: 2,
};

export async function autoFillKoPhase(formData: FormData) {
  await requireAdmin();
  const { phaseId } = autoFillSchema.parse({ phaseId: formData.get("phaseId") });
  const prevPhase = PREV_PHASE[phaseId];
  const expected = EXPECTED_PREV_COUNT[phaseId];

  const prevMatches = await db
    .select()
    .from(matches)
    .where(and(eq(matches.phaseId, prevPhase), eq(matches.status, "finished")))
    .orderBy(asc(matches.kickoffAt), asc(matches.id));

  if (prevMatches.length !== expected) {
    throw new Error(
      `La phase ${prevPhase.toUpperCase()} n'est pas complète : ${prevMatches.length}/${expected} matchs terminés.`,
    );
  }
  if (prevMatches.some((m) => !m.winnerId)) {
    throw new Error(
      `Tous les matchs ${prevPhase.toUpperCase()} doivent avoir un vainqueur saisi.`,
    );
  }

  const loserOf = (m: (typeof prevMatches)[number]): string | null => {
    if (m.winnerId === m.homeTeamId) return m.awayTeamId;
    if (m.winnerId === m.awayTeamId) return m.homeTeamId;
    return null;
  };

  type NewMatch = {
    id: string;
    phaseId: typeof phaseId;
    homeTeamId: string;
    awayTeamId: string;
  };
  const newMatches: NewMatch[] = [];

  if (phaseId === "final") {
    const sf0 = prevMatches[0]!;
    const sf1 = prevMatches[1]!;
    const lose0 = loserOf(sf0);
    const lose1 = loserOf(sf1);
    if (!lose0 || !lose1 || !sf0.winnerId || !sf1.winnerId) {
      throw new Error("Impossible de déterminer les perdants des demi-finales.");
    }
    newMatches.push(
      {
        id: "final-petite",
        phaseId: "final",
        homeTeamId: lose0,
        awayTeamId: lose1,
      },
      {
        id: "final-grande",
        phaseId: "final",
        homeTeamId: sf0.winnerId,
        awayTeamId: sf1.winnerId,
      },
    );
  } else {
    for (let i = 0; i < prevMatches.length; i += 2) {
      const a = prevMatches[i]!;
      const b = prevMatches[i + 1]!;
      newMatches.push({
        id: `${phaseId}-${String(i / 2 + 1).padStart(2, "0")}`,
        phaseId,
        homeTeamId: a.winnerId!,
        awayTeamId: b.winnerId!,
      });
    }
  }

  // Insert / refresh: si une affiche existe déjà avec cet id, on remplace les
  // équipes uniquement (sans toucher au vainqueur déjà éventuellement saisi).
  for (const m of newMatches) {
    await db
      .insert(matches)
      .values({
        id: m.id,
        phaseId: m.phaseId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        status: "scheduled",
      })
      .onConflictDoUpdate({
        target: matches.id,
        set: {
          phaseId: m.phaseId,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
        },
      });
  }

  revalidatePath("/admin/matches");
  revalidatePath(`/picks/${phaseId}`);
}

/* ============================================================
   Scoring triggers
============================================================ */

export async function runScoreGroups(): Promise<void> {
  await requireAdmin();
  await scoreGroupsPhase();
  await db
    .update(phases)
    .set({ status: "scored" })
    .where(eq(phases.id, "groups"));
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
}

export async function runScoreKo(formData: FormData): Promise<void> {
  await requireAdmin();
  const phaseId = z.enum(KO_IDS).parse(formData.get("phaseId"));
  const res = await scoreKoPhase(phaseId);
  if (res.processed > 0) {
    await db
      .update(phases)
      .set({ status: "scored" })
      .where(eq(phases.id, phaseId));
  }
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
}

export async function runScoreAll(): Promise<void> {
  await requireAdmin();
  await scoreAllPhases();
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
}
