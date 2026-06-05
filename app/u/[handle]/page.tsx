import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getUserByHandle,
  getUserGroupTopPicks,
  getUserPhaseScores,
  isGroupsPhaseRevealed,
} from "@/lib/profile";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { Avatar } from "@/components/ui/Avatar";
import { TeamFlag } from "@/components/ui/TeamFlag";
import { XIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const PHASE_MAX: Record<string, number> = {
  groups: 86,
  r32: 80,
  r16: 64,
  qf: 48,
  sf: 36,
  final: 40,
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "");

  const profile = await getUserByHandle(handle);
  if (!profile) notFound();

  const [session, phaseScores, groupTops, groupsRevealed] = await Promise.all([
    auth(),
    getUserPhaseScores(profile.id),
    getUserGroupTopPicks(profile.id),
    isGroupsPhaseRevealed(),
  ]);

  const isMe = session?.user?.id === profile.id;
  const totalPoints = phaseScores.reduce((acc, p) => acc + p.points, 0);
  const name = profile.displayName || profile.handle;

  // Picks revealed only post-lock (groups phase deadline passed).
  const canSeePicks = groupsRevealed || isMe;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      {/* Hero */}
      <div
        className="pb-7 mb-7"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <SectionLabel>
          Profil public · /u/{profile.handle}
        </SectionLabel>
        <div className="mt-4 flex items-end justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-6">
            <Avatar src={profile.avatarUrl} name={name} size={96} />
            <div>
              <Display size={72} style={{ fontSize: "clamp(48px, 7vw, 72px)" }}>
                {name}
              </Display>
              <div className="font-mono text-[13px] text-[color:var(--paper-3)] mt-2">
                @{profile.handle} · INSCRIT LE{" "}
                {profile.createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
                {isMe && (
                  <span className="ml-2" style={{ color: "var(--mexico)" }}>
                    · C&rsquo;EST TOI
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-6 flex-wrap">
                <MiniKPI label="POINTS" value={String(totalPoints)} tone="var(--gold)" />
                <MiniKPI label="PHASES LOCKÉES" value={`${phaseScores.filter((p) => p.points > 0).length}`} />
                <MiniKPI
                  label="GROUPES PICKÉS"
                  value={String(groupTops.length)}
                />
              </div>
            </div>
          </div>
          <a
            href={`https://x.com/${profile.handle}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-x btn-sm"
          >
            <XIcon />
            Voir sur X
          </a>
        </div>
      </div>

      {/* Phase breakdown */}
      <section className="mb-7">
        <SectionLabel num="P.1 — P.6">Points par phase</SectionLabel>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {phaseScores.map((p) => {
            const max = PHASE_MAX[p.id] ?? 0;
            const ratio = max > 0 ? Math.min(1, p.points / max) : 0;
            const done = p.points > 0;
            return (
              <div
                key={p.id}
                className="p-4 rounded-md"
                style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
              >
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[color:var(--paper-3)]">
                  {p.labelFr}
                </div>
                <div className="mt-1.5">
                  <span
                    className="font-display"
                    style={{
                      fontSize: 34,
                      lineHeight: 1,
                      color: done ? "var(--paper-1)" : "var(--paper-3)",
                    }}
                  >
                    {p.points}
                  </span>
                  <span className="text-[14px] text-[color:var(--paper-3)]"> / {max}</span>
                </div>
                <div
                  className="mt-2 h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--ink-1)" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${ratio * 100}%`,
                      background: done ? "var(--mexico)" : "var(--paper-4)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Group tops + Achievements */}
      <section className="grid lg:grid-cols-[1.6fr,1fr] gap-7">
        <div>
          <div className="flex items-baseline justify-between mb-3.5">
            <SectionLabel num="REC.">Tops de groupes prédits</SectionLabel>
            <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)]">
              {groupTops.length}/12 RENSEIGNÉS
            </span>
          </div>
          {!canSeePicks ? (
            <div
              className="p-6 rounded-md text-[13px] text-[color:var(--paper-3)]"
              style={{
                background: "var(--ink-2)",
                border: "1px dashed var(--line-strong)",
              }}
            >
              🔒 Les picks de ce joueur deviendront publics après le coup
              d&rsquo;envoi.
            </div>
          ) : groupTops.length === 0 ? (
            <div
              className="p-6 rounded-md text-[13px] text-[color:var(--paper-3)]"
              style={{
                background: "var(--ink-2)",
                border: "1px solid var(--line)",
              }}
            >
              Aucun pick enregistré.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {groupTops.map((g) => (
                <div
                  key={g.groupLetter}
                  className="grid items-center gap-2 rounded-md"
                  style={{
                    gridTemplateColumns: "auto auto 1fr",
                    padding: "10px 12px 10px 14px",
                    background: "var(--ink-3)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: "var(--paper-4)", letterSpacing: 0.8 }}
                  >
                    {g.groupLetter}
                  </span>
                  <TeamFlag code={g.teamId} height={14} />
                  <span className="text-[13px] truncate text-[color:var(--paper-1)]">
                    <span className="font-mono text-[11px] mr-2 text-[color:var(--paper-3)]">
                      {g.teamId}
                    </span>
                    {g.teamNameFr}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionLabel num="ACH.">Badges &amp; faits d&rsquo;armes</SectionLabel>
          <div className="mt-3.5 grid gap-2.5">
            <Badge
              icon="⚡"
              title="Premier locké"
              sub="Picks lockés > 24h avant la deadline"
              unlocked={false}
            />
            <Badge
              icon="🎯"
              title="Madame Irma"
              sub="9/12 tops de groupes exacts"
              unlocked={false}
            />
            <Badge
              icon="🥉"
              title="Le 3ème œil"
              sub="6/8 meilleurs 3èmes corrects"
              unlocked={false}
            />
            <Badge
              icon="👑"
              title="Royaume"
              sub="Champion correct (à débloquer)"
              unlocked={false}
            />
          </div>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/leaderboard"
          className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
        >
          ← Retour au classement
        </Link>
      </div>
    </div>
  );
}

function MiniKPI({
  label,
  value,
  tone = "var(--paper-1)",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9.5px] tracking-[0.14em] text-[color:var(--paper-3)] uppercase">
        {label}
      </div>
      <div
        className="font-display"
        style={{ fontSize: 28, lineHeight: 1, color: tone, marginTop: 2 }}
      >
        {value}
      </div>
    </div>
  );
}

function Badge({
  icon,
  title,
  sub,
  unlocked,
}: {
  icon: string;
  title: string;
  sub: string;
  unlocked: boolean;
}) {
  return (
    <div
      className="grid items-center gap-3 px-3.5 py-3 rounded-md"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        background: unlocked ? "var(--ink-3)" : "var(--ink-2)",
        border: unlocked
          ? "1px solid var(--line-strong)"
          : "1px dashed var(--line)",
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
        {icon}
      </span>
      <div>
        <div className="text-[13px] font-medium text-[color:var(--paper-1)]">
          {title}
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--paper-3)]">
          {sub}
        </div>
      </div>
      <span
        className="font-mono text-[10px] tracking-[0.12em]"
        style={{ color: unlocked ? "var(--mexico)" : "var(--paper-4)" }}
      >
        {unlocked ? "✓" : "·"}
      </span>
    </div>
  );
}
