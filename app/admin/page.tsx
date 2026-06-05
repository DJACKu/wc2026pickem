import Link from "next/link";
import { count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { getAllPhases } from "@/lib/phases";
import { db, matches, resultsGroupStandings, users } from "@/db";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  runScoreAll,
  runScoreGroups,
  runScoreKo,
  updatePhase,
} from "./actions";

export const dynamic = "force-dynamic";

const KO_IDS = ["r32", "r16", "qf", "sf", "final"] as const;

export default async function AdminPage() {
  await requireAdmin();

  const [phasesList, userCount, matchCount, standingsCount] = await Promise.all([
    getAllPhases(),
    db.select({ n: count() }).from(users).then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: count() }).from(matches).then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: count() })
      .from(resultsGroupStandings)
      .then((r) => Number(r[0]?.n ?? 0)),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <SectionLabel num="ADMIN">Console</SectionLabel>
      <Display
        size={64}
        className="mt-3.5"
        style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
      >
        Pilotage du tournoi.
      </Display>

      {/* KPIs */}
      <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Joueurs" value={userCount} />
        <Kpi label="Phases" value={phasesList.length} />
        <Kpi label="Standings poules" value={`${standingsCount}/48`} />
        <Kpi label="Matchs KO créés" value={matchCount} />
      </div>

      {/* Sub-nav */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/standings" className="btn btn-ghost btn-md">
          Saisir les standings poules →
        </Link>
        <Link href="/admin/matches" className="btn btn-ghost btn-md">
          Saisir / éditer les matchs KO →
        </Link>
        <form action={runScoreAll}>
          <button className="btn btn-primary btn-md" type="submit">
            ⟳ Rescorer toutes les phases
          </button>
        </form>
      </div>

      {/* Phases table */}
      <section className="mt-10">
        <SectionLabel num="PH.">Phases</SectionLabel>
        <div
          className="mt-3 rounded-[10px] overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          {phasesList.map((p, i) => (
            <PhaseRow
              key={p.id}
              phase={p}
              isFirst={i === 0}
              showScoreButton={p.id === "groups" || KO_IDS.includes(p.id as (typeof KO_IDS)[number])}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 text-[11px] font-mono text-[color:var(--paper-4)]">
        Le scoring est <strong className="text-[color:var(--paper-2)]">idempotent</strong>.
        Un rescore à tout moment ré-écrit les `scores` proprement, sans casser
        l&rsquo;historique des picks. Source de vérité : la table{" "}
        <code>results_group_standings</code> (poules) et la colonne{" "}
        <code>winner_id</code> de <code>matches</code> (KO).
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="p-4 rounded-md"
      style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.13em] uppercase text-[color:var(--paper-3)]">
        {label}
      </div>
      <div className="font-display text-[40px] leading-none mt-1 text-[color:var(--paper-1)]">
        {value}
      </div>
    </div>
  );
}

function PhaseRow({
  phase,
  isFirst,
  showScoreButton,
}: {
  phase: {
    id: string;
    labelFr: string;
    status: "upcoming" | "open" | "locked" | "scored";
    locksAt: Date;
  };
  isFirst: boolean;
  showScoreButton: boolean;
}) {
  return (
    <div
      className="grid items-center gap-3 px-5 py-4"
      style={{
        gridTemplateColumns: "minmax(140px, 1fr) 140px 280px auto",
        borderTop: isFirst ? "none" : "1px solid var(--line)",
      }}
    >
      <div>
        <div className="font-display text-[22px] leading-none">{phase.labelFr}</div>
        <div className="font-mono text-[10px] tracking-[0.1em] text-[color:var(--paper-4)] mt-1">
          ID · {phase.id.toUpperCase()}
        </div>
      </div>
      <div>
        <StatusPill status={phase.status} />
      </div>
      <form
        action={updatePhase}
        className="flex items-center gap-2 flex-wrap"
      >
        <input type="hidden" name="phaseId" value={phase.id} />
        <select
          name="status"
          defaultValue={phase.status}
          className="px-2 py-1 rounded-md font-mono text-[11px]"
          style={{
            background: "var(--ink-1)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
          }}
        >
          <option value="upcoming">À venir</option>
          <option value="open">Ouvert</option>
          <option value="locked">Locké</option>
          <option value="scored">Scoré</option>
        </select>
        <input
          name="locksAt"
          type="datetime-local"
          defaultValue={localIso(phase.locksAt)}
          className="px-2 py-1 rounded-md font-mono text-[11px]"
          style={{
            background: "var(--ink-1)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
          }}
        />
        <button type="submit" className="btn btn-ghost btn-sm">
          Sauver
        </button>
      </form>
      <div className="flex justify-end">
        {showScoreButton && (
          <form
            action={phase.id === "groups" ? runScoreGroups : runScoreKo}
            className="inline"
          >
            {phase.id !== "groups" && (
              <input type="hidden" name="phaseId" value={phase.id} />
            )}
            <button type="submit" className="btn btn-lock btn-sm">
              ⟳ Scorer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function localIso(d: Date): string {
  // For <input type="datetime-local"> — needs YYYY-MM-DDTHH:mm without tz
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
