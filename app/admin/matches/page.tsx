import Link from "next/link";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db, matches, teams } from "@/db";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { StatusPill } from "@/components/ui/StatusPill";
import { TeamFlag } from "@/components/ui/TeamFlag";
import {
  autoFillKoPhase,
  createMatch,
  deleteMatch,
  setMatchResult,
} from "../actions";

export const dynamic = "force-dynamic";

const KO_IDS = ["r32", "r16", "qf", "sf", "final"] as const;

export default async function MatchesAdminPage() {
  await requireAdmin();

  const [allTeams, allMatches] = await Promise.all([
    db.select().from(teams).orderBy(asc(teams.nameFr)),
    db.select().from(matches).orderBy(asc(matches.phaseId), asc(matches.kickoffAt)),
  ]);

  const byPhase: Record<string, typeof allMatches> = {};
  for (const p of KO_IDS) byPhase[p] = [];
  for (const m of allMatches) (byPhase[m.phaseId] ??= []).push(m);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <Link
        href="/admin"
        className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
      >
        ← ADMIN
      </Link>
      <SectionLabel num="KO">Matchs &amp; résultats</SectionLabel>
      <Display size={56} className="mt-3" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
        Bracket builder.
      </Display>
      <p className="mt-3 text-[13px] text-[color:var(--paper-2)] max-w-2xl">
        Crée les affiches KO au fil du tournoi, puis saisis le vainqueur quand
        le match est terminé. Tout passe par la table <code>matches</code> —
        <code>manual_override=true</code> protège ta saisie du cron éventuel.
      </p>

      {/* Create form */}
      <form
        action={createMatch}
        className="mt-6 rounded-[10px] p-5 grid gap-3"
        style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
      >
        <SectionLabel num="+">Nouvelle affiche</SectionLabel>
        <div className="grid sm:grid-cols-5 gap-2 items-end">
          <Field label="ID interne">
            <input
              required
              name="matchId"
              placeholder="r32-01"
              className="w-full px-2 py-1.5 rounded-md font-mono text-[12px]"
              style={{
                background: "var(--ink-1)",
                border: "1px solid var(--line-strong)",
                color: "var(--paper-1)",
              }}
            />
          </Field>
          <Field label="Phase">
            <select name="phaseId" required className="w-full px-2 py-1.5 rounded-md text-[12.5px]"
              style={{ background: "var(--ink-1)", border: "1px solid var(--line-strong)", color: "var(--paper-1)" }}
            >
              {KO_IDS.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </Field>
          <Field label="Domicile">
            <TeamSelect name="homeTeamId" teams={allTeams} />
          </Field>
          <Field label="Extérieur">
            <TeamSelect name="awayTeamId" teams={allTeams} />
          </Field>
          <Field label="Coup d'envoi (UTC)">
            <input
              required
              name="kickoffAt"
              type="datetime-local"
              className="w-full px-2 py-1.5 rounded-md text-[12px]"
              style={{
                background: "var(--ink-1)",
                border: "1px solid var(--line-strong)",
                color: "var(--paper-1)",
              }}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary btn-sm">
            Créer le match
          </button>
        </div>
      </form>

      {/* Match lists per phase */}
      {KO_IDS.map((phaseId) => {
        const list = byPhase[phaseId] ?? [];
        const canAutoFill = phaseId !== "r32";
        return (
          <section key={phaseId} className="mt-10">
            <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
              <SectionLabel num={phaseId.toUpperCase()}>Phase</SectionLabel>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.13em] text-[color:var(--paper-4)]">
                  {list.length} affiche{list.length > 1 ? "s" : ""}
                </span>
                {canAutoFill && (
                  <form action={autoFillKoPhase}>
                    <input type="hidden" name="phaseId" value={phaseId} />
                    <button type="submit" className="btn btn-ghost btn-sm">
                      ⟳ Générer depuis {prevLabelOf(phaseId)}
                    </button>
                  </form>
                )}
              </div>
            </div>
            {list.length === 0 ? (
              <div
                className="p-5 rounded-md text-[13px] text-[color:var(--paper-3)]"
                style={{
                  background: "var(--ink-2)",
                  border: "1px dashed var(--line-strong)",
                }}
              >
                {phaseId === "r32"
                  ? "Aucun match. Crée les 16 affiches R32 manuellement (selon le tirage FIFA officiel)."
                  : `Aucun match. Termine la phase ${prevLabelOf(phaseId)} et clique « Générer ».`}
              </div>
            ) : (
              <div className="grid gap-2">
                {list.map((m) => (
                  <MatchAdminRow key={m.id} match={m} teamsList={allTeams} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function prevLabelOf(phaseId: string): string {
  switch (phaseId) {
    case "r16": return "R32";
    case "qf": return "R16";
    case "sf": return "QF";
    case "final": return "SF";
    default: return "—";
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9.5px] tracking-[0.13em] uppercase text-[color:var(--paper-3)] block mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function TeamSelect({
  name,
  teams,
  defaultValue,
}: {
  name: string;
  teams: { id: string; nameFr: string; flagEmoji: string | null; groupLetter: string }[];
  defaultValue?: string;
}) {
  return (
    <select
      name={name}
      required
      defaultValue={defaultValue ?? ""}
      className="w-full px-2 py-1.5 rounded-md text-[12.5px]"
      style={{
        background: "var(--ink-1)",
        border: "1px solid var(--line-strong)",
        color: "var(--paper-1)",
      }}
    >
      <option value="">— Choisis —</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.id} · {t.nameFr} (G.{t.groupLetter})
        </option>
      ))}
    </select>
  );
}

function MatchAdminRow({
  match,
  teamsList,
}: {
  match: typeof matches.$inferSelect;
  teamsList: { id: string; nameFr: string; flagEmoji: string | null; groupLetter: string }[];
}) {
  const home = teamsList.find((t) => t.id === match.homeTeamId);
  const away = teamsList.find((t) => t.id === match.awayTeamId);
  const finished = match.status === "finished";

  return (
    <div
      className="rounded-md p-3 grid gap-3 items-center"
      style={{
        background: "var(--ink-2)",
        border: finished
          ? "1px solid var(--line-strong)"
          : "1px solid var(--line)",
        gridTemplateColumns: "minmax(180px, 1fr) 1fr auto auto",
      }}
    >
      <div>
        <div className="font-mono text-[10px] tracking-[0.1em] text-[color:var(--paper-4)]">
          {match.id.toUpperCase()} ·{" "}
          {match.kickoffAt?.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="mt-1 text-[13.5px] flex items-center gap-2 flex-wrap">
          {home && <TeamFlag code={home.id} height={14} />}
          <span className="font-mono text-[11px]">{home?.id}</span>
          <span>{home?.nameFr}</span>
          <span className="mx-1 text-[color:var(--paper-3)]">vs</span>
          {away && <TeamFlag code={away.id} height={14} />}
          <span className="font-mono text-[11px]">{away?.id}</span>
          <span>{away?.nameFr}</span>
        </div>
      </div>

      <form
        action={setMatchResult}
        className="flex items-center gap-2 flex-wrap"
      >
        <input type="hidden" name="matchId" value={match.id} />
        <input
          name="homeScore"
          type="number"
          min={0}
          defaultValue={match.homeScore ?? 0}
          className="w-14 px-2 py-1 rounded-md font-mono text-[12px]"
          style={{
            background: "var(--ink-1)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
          }}
        />
        <span className="text-[color:var(--paper-3)]">–</span>
        <input
          name="awayScore"
          type="number"
          min={0}
          defaultValue={match.awayScore ?? 0}
          className="w-14 px-2 py-1 rounded-md font-mono text-[12px]"
          style={{
            background: "var(--ink-1)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
          }}
        />
        <select
          name="winnerId"
          required
          defaultValue={match.winnerId ?? ""}
          className="px-2 py-1 rounded-md font-mono text-[11.5px]"
          style={{
            background: "var(--ink-1)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
          }}
        >
          <option value="">Vainqueur</option>
          {match.homeTeamId && (
            <option value={match.homeTeamId}>{home?.id} · {home?.nameFr}</option>
          )}
          {match.awayTeamId && (
            <option value={match.awayTeamId}>{away?.id} · {away?.nameFr}</option>
          )}
        </select>
        <input type="hidden" name="status" value="finished" />
        <button type="submit" className="btn btn-lock btn-sm">
          {finished ? "Mettre à jour" : "Terminé"}
        </button>
      </form>

      <StatusPill status={finished ? "scored" : "upcoming"}>
        {finished ? "Terminé" : "À jouer"}
      </StatusPill>

      <form action={deleteMatch}>
        <input type="hidden" name="matchId" value={match.id} />
        <button type="submit" className="btn btn-ghost btn-sm" title="Supprimer">
          ✕
        </button>
      </form>
    </div>
  );
}
