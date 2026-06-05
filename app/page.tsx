import Link from "next/link";
import { count } from "drizzle-orm";
import { auth } from "@/auth";
import { db, users } from "@/db";
import { getAllPhases } from "@/lib/phases";
import { timeUntil, pad2 } from "@/lib/format";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { TeamFlag } from "@/components/ui/TeamFlag";
import { SignInButton } from "@/components/SignInButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, phasesList, userCount] = await Promise.all([
    auth(),
    getAllPhases().catch(() => []),
    db
      .select({ n: count() })
      .from(users)
      .then((r) => Number(r[0]?.n ?? 0))
      .catch(() => 0),
  ]);

  const groupsPhase = phasesList.find((p) => p.id === "groups");
  const tournamentStarted =
    !!groupsPhase && new Date(groupsPhase.locksAt).getTime() <= Date.now();
  const currentPhase = phasesList.find(
    (p) =>
      new Date(p.locksAt).getTime() > Date.now() ||
      (p.status === "open" && !tournamentStarted),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-16">
      <div className="grid lg:grid-cols-[1.35fr,1fr] gap-12 lg:gap-16 items-start">
        {/* LEFT — editorial hero */}
        <div>
          <SectionLabel num="ÉD. 01">
            Coupe du Monde 2026 · CAN · MEX · USA
          </SectionLabel>

          <Display
            size={104}
            className="mt-6"
            style={{ fontSize: "clamp(56px, 9vw, 120px)", letterSpacing: "-0.02em" }}
          >
            Picke ton
            <br />
            <span style={{ color: "var(--paper-3)" }}>tournoi.</span>
            <br />
            Lock&rsquo;em.{" "}
            <span style={{ color: "var(--canada)" }}>Suis</span>
            <br />
            les autres tomber.
          </Display>

          <p className="max-w-md mt-7 text-[16px] leading-[1.55] text-[color:var(--paper-2)]">
            Un pick&rsquo;em façon esport pour la WC 2026, entre potes.
            Tu classes les poules, tu locks. Tu reviens voir ton classement après
            chaque phase.{" "}
            <em className="text-[color:var(--paper-3)]">
              Pas de mail, pas d&rsquo;argent, pas de bullshit.
            </em>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {session ? (
              <Link href="/picks" className="btn btn-primary btn-lg">
                Faire mes picks →
              </Link>
            ) : (
              <SignInButton size="lg">Continuer avec X</SignInButton>
            )}
            <span className="font-mono text-[11px] tracking-[0.08em] leading-[1.4] text-[color:var(--paper-3)] max-w-[220px]">
              On lit ton handle, ton avatar — rien d&rsquo;autre.
            </span>
          </div>
        </div>

        {/* RIGHT — état du tournoi */}
        <aside
          className="rounded-[10px] p-6"
          style={{
            background: "var(--ink-2)",
            border: "1px solid var(--line)",
          }}
        >
          <SectionLabel
            num={
              tournamentStarted
                ? "EN COURS"
                : groupsPhase
                  ? jLabel(groupsPhase.locksAt)
                  : "J−?"
            }
          >
            État du tournoi
          </SectionLabel>

          <div className="mt-4 grid gap-3">
            <KPI label="Équipes engagées" value="48" />
            <KPI label="Groupes" value="12" />
            <KPI label="Matchs au total" value="104" />
            <KPI label="Joueurs inscrits" value={String(userCount)} highlight />
          </div>

          <div className="h-px my-5" style={{ background: "var(--line)" }} />

          {!tournamentStarted ? (
            <>
              <div
                className="font-mono uppercase mb-2 text-[10.5px] tracking-[0.14em]"
                style={{ color: "var(--canada)" }}
              >
                ● Premier match
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <TeamFlag code="MEX" height={28} />
                <span className="font-display text-[28px] leading-none text-[color:var(--paper-1)]">
                  MEX
                </span>
                <span className="font-display text-[22px] leading-none text-[color:var(--paper-3)] mx-1">
                  vs
                </span>
                <span className="font-display text-[28px] leading-none text-[color:var(--paper-1)]">
                  KOR
                </span>
                <TeamFlag code="KOR" height={28} />
              </div>
              <div className="font-mono text-[12px] text-[color:var(--paper-2)] mt-2">
                11 juin · Estadio Azteca · Mexico City
              </div>
              {groupsPhase && (
                <BigCountdown locksAt={groupsPhase.locksAt.toISOString()} />
              )}
            </>
          ) : (
            <>
              <div
                className="font-mono uppercase mb-2 text-[10.5px] tracking-[0.14em]"
                style={{ color: "var(--mexico)" }}
              >
                ● Phase active
              </div>
              <div className="font-display text-[36px] leading-none text-[color:var(--paper-1)]">
                {currentPhase?.labelFr ?? "Tournoi en cours"}
              </div>
              {currentPhase && (
                <div className="font-mono text-[12px] text-[color:var(--paper-2)] mt-2">
                  Lock {new Date(currentPhase.locksAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
                </div>
              )}
              <Link
                href="/leaderboard"
                className="btn btn-primary btn-md mt-5"
              >
                Voir le classement →
              </Link>
            </>
          )}
        </aside>
      </div>

      {/* Bottom strip — règles */}
      <section className="mt-20 grid md:grid-cols-3 gap-3">
        <RuleCard
          accent="canada"
          title="Login en 1 clic"
          body="Connexion avec X. Pas d'email, pas de mot de passe. Ton handle, ton avatar, c'est tout."
        />
        <RuleCard
          accent="mexico"
          title="Tu pickes, tu LOCK"
          body="Avant le coup d'envoi de chaque phase. Après, immuable — même si tu changes l'heure de ton PC."
        />
        <RuleCard
          accent="usa"
          title="Groupes d'amis"
          body="Un code d'invitation, partagez-le. Comparez vos cartes en live tout au long du tournoi."
        />
      </section>
    </div>
  );
}

function KPI({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] text-[color:var(--paper-2)]">{label}</span>
      <span
        className="font-display"
        style={{
          fontSize: 26,
          lineHeight: 1,
          color: highlight ? "var(--mexico)" : "var(--paper-1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function BigCountdown({ locksAt }: { locksAt: string }) {
  const t = timeUntil(locksAt);
  if (t.totalMs <= 0) {
    return (
      <div
        className="mt-5 p-4 rounded-md text-center font-display text-[28px]"
        style={{
          background: "var(--ink-3)",
          border: "1px solid var(--line)",
          color: "var(--canada)",
        }}
      >
        Lock passé.
      </div>
    );
  }
  return (
    <>
      <div
        className="mt-5 px-4 py-4 rounded-md grid grid-cols-4 gap-1 text-center"
        style={{ background: "var(--ink-3)", border: "1px solid var(--line)" }}
      >
        {[
          { v: pad2(t.days), l: "JOURS" },
          { v: pad2(t.hours), l: "HEURES" },
          { v: pad2(t.minutes), l: "MIN" },
          { v: pad2(t.seconds), l: "SEC" },
        ].map((c) => (
          <div key={c.l}>
            <div className="font-display text-[32px] leading-none text-[color:var(--paper-1)]">
              {c.v}
            </div>
            <div className="font-mono text-[9px] tracking-[0.14em] text-[color:var(--paper-3)] mt-1">
              {c.l}
            </div>
          </div>
        ))}
      </div>
      <div className="font-mono mt-2.5 text-center text-[10px] tracking-[0.13em] text-[color:var(--paper-3)]">
        AVANT LE LOCK DES POULES
      </div>
    </>
  );
}

function RuleCard({
  accent,
  title,
  body,
}: {
  accent: "canada" | "mexico" | "usa";
  title: string;
  body: string;
}) {
  const color = {
    canada: "var(--canada)",
    mexico: "var(--mexico)",
    usa: "var(--usa)",
  }[accent];
  return (
    <div
      className="relative p-5 rounded-[10px]"
      style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: color }}
      />
      <div className="font-display text-[24px] leading-tight pl-1">{title}</div>
      <div className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--paper-2)] pl-1">
        {body}
      </div>
    </div>
  );
}

function jLabel(d: Date | string): string {
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return "J+" + Math.abs(days);
  if (days === 0) return "JOUR J";
  return "J−" + days;
}
