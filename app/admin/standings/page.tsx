import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db, resultsGroupStandings, teams } from "@/db";
import { asc, eq } from "drizzle-orm";
import { GROUP_LETTERS } from "@/db/seed-data";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { saveGroupStanding } from "../actions";

export const dynamic = "force-dynamic";

export default async function StandingsAdminPage() {
  await requireAdmin();

  const [teamRows, standingsRows] = await Promise.all([
    db.select().from(teams).orderBy(asc(teams.groupLetter), asc(teams.nameFr)),
    db.select().from(resultsGroupStandings),
  ]);

  const teamsByGroup: Record<string, typeof teamRows> = {};
  for (const l of GROUP_LETTERS) teamsByGroup[l] = [];
  for (const t of teamRows) teamsByGroup[t.groupLetter]?.push(t);

  const standingsByGroup: Record<
    string,
    { byPos: Record<number, { teamId: string; isBestThird: boolean }> }
  > = {};
  for (const l of GROUP_LETTERS) standingsByGroup[l] = { byPos: {} };
  for (const s of standingsRows) {
    standingsByGroup[s.groupLetter].byPos[s.finalPos] = {
      teamId: s.teamId,
      isBestThird: s.isBestThird,
    };
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <Link
        href="/admin"
        className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
      >
        ← ADMIN
      </Link>
      <SectionLabel num="POULES">Standings finales</SectionLabel>
      <Display size={56} className="mt-3" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
        Saisis les positions finales.
      </Display>
      <p className="mt-3 text-[13px] text-[color:var(--paper-2)] max-w-2xl">
        Pour chaque poule, l&rsquo;ordre final 1 → 4. Coche la case 3ème si
        l&rsquo;équipe est un <strong style={{ color: "var(--gold)" }}>meilleur 3ème</strong> qualifié au R32.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUP_LETTERS.map((letter) => {
          const groupTeams = teamsByGroup[letter] ?? [];
          const saved = standingsByGroup[letter];
          const isComplete = Object.keys(saved.byPos).length === 4;
          return (
            <form
              key={letter}
              action={saveGroupStanding}
              className="rounded-[10px] p-4"
              style={{
                background: "var(--ink-2)",
                border: isComplete
                  ? "1px solid var(--mexico)"
                  : "1px solid var(--line)",
              }}
            >
              <input type="hidden" name="groupLetter" value={letter} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] tracking-[0.13em] text-[color:var(--paper-3)]">
                    POULE
                  </span>
                  <span className="font-display text-[26px] leading-none">
                    {letter}
                  </span>
                </div>
                {isComplete && (
                  <span
                    className="font-mono text-[10px] tracking-[0.13em]"
                    style={{ color: "var(--mexico)" }}
                  >
                    ✓ SAUVÉ
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                {[1, 2, 3, 4].map((pos) => (
                  <div
                    key={pos}
                    className="grid gap-2 items-center"
                    style={{ gridTemplateColumns: "24px 1fr" }}
                  >
                    <span className="font-mono text-[11px] text-[color:var(--paper-3)]">
                      {pos}
                    </span>
                    <select
                      name={`pos${pos}`}
                      required
                      defaultValue={saved.byPos[pos]?.teamId ?? ""}
                      className="px-2 py-1.5 rounded-md text-[12.5px]"
                      style={{
                        background: "var(--ink-1)",
                        border: "1px solid var(--line-strong)",
                        color: "var(--paper-1)",
                      }}
                    >
                      <option value="">— Choisis —</option>
                      {groupTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} · {t.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <label className="mt-3 flex items-center gap-2 text-[12px]">
                <input
                  type="checkbox"
                  name="pos3IsBestThird"
                  defaultChecked={saved.byPos[3]?.isBestThird ?? false}
                  className="accent-[color:var(--gold)]"
                />
                <span style={{ color: "var(--gold)" }}>
                  3ème = meilleur 3ème qualifié R32
                </span>
              </label>

              <div className="mt-3 flex justify-end">
                <button type="submit" className="btn btn-primary btn-sm">
                  Sauver poule {letter}
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
