import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, matches, resultsGroupStandings } from "@/db";

/* ============================================================
   Cron — sync des résultats football-data.org (free tier).
   ROADMAP §4.5 : ce job ne doit JAMAIS écraser les résultats
   saisis à la main par l'admin (matches.manual_override = true).
   La source de vérité finale reste l'admin.
============================================================ */

export const dynamic = "force-dynamic";

async function verify(req: Request): Promise<boolean> {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const expected = process.env.CRON_SECRET;
  if (!expected) return false; // refuse si pas configuré
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  if (!verify(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return NextResponse.json({
      ok: true,
      mode: "noop",
      note: "FOOTBALL_DATA_TOKEN absent — saisie admin uniquement.",
      ts: new Date().toISOString(),
    });
  }

  // Pull MS WC matches (free tier endpoint).
  let res: Response;
  try {
    res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "fetch failed", details: String(e) },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, status: res.status, text: await res.text().catch(() => "") },
      { status: 502 },
    );
  }

  const payload = (await res.json()) as {
    matches?: Array<{
      id: number;
      utcDate: string;
      status: string;
      homeTeam?: { tla?: string; shortName?: string };
      awayTeam?: { tla?: string; shortName?: string };
      score?: {
        fullTime?: { home: number | null; away: number | null };
        winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
      };
    }>;
  };
  const incoming = payload.matches ?? [];

  // Update only finished matches where we haven't been manually overridden,
  // and where we already have a row with the same ID (we don't auto-create
  // affiches — the admin builds the bracket).
  let touched = 0;
  for (const fd of incoming) {
    if (!["FINISHED", "IN_PLAY", "PAUSED"].includes(fd.status)) continue;
    const isFinished = fd.status === "FINISHED";
    const matchStatus = isFinished ? "finished" : "live";

    const matchId = `fd-${fd.id}`;
    const [existing] = await db
      .select({
        id: matches.id,
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        override: matches.manualOverride,
      })
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);
    if (!existing || existing.override) continue;

    const winnerHome = fd.score?.winner === "HOME_TEAM";
    const winnerAway = fd.score?.winner === "AWAY_TEAM";
    const winnerId = winnerHome ? existing.homeTeamId : winnerAway ? existing.awayTeamId : null;

    await db
      .update(matches)
      .set({
        homeScore: fd.score?.fullTime?.home ?? null,
        awayScore: fd.score?.fullTime?.away ?? null,
        winnerId,
        status: matchStatus,
      })
      .where(
        and(eq(matches.id, matchId), eq(matches.manualOverride, false)),
      );
    touched += 1;
  }

  return NextResponse.json({
    ok: true,
    mode: "live",
    incoming: incoming.length,
    touched,
    ts: new Date().toISOString(),
  });
}
