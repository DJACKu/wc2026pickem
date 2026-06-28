import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getUserBadges,
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
import { db, matches, phases } from "@/db";
import { asc, inArray } from "drizzle-orm";
import {
  getAllTeams,
  getPhase,
  getMatchesByPhase,
  getStartedGroups,
  getUserGroupPicks,
  getUserThirdPicks,
  getUserAllMatchPicks,
} from "@/lib/picks";
import { GROUP_LETTERS } from "@/db/seed-data";
import { PublicPicks } from "./PublicPicks";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "");
  const profile = await getUserByHandle(handle);
  if (!profile) return { title: "Profil — Pick'em WC26" };
  const name = profile.displayName || profile.handle;
  return {
    title: `${name} (@${profile.handle}) — Pick'em WC26`,
    description: `Carte de picks de ${name} pour la Coupe du Monde 2026.`,
    openGraph: {
      title: `${name} — Pick'em WC26`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

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

  const [
    session,
    phaseScores,
    groupTops,
    groupsRevealed,
    badges,
    allTeams,
    groupsPhase,
    allGroupsMatches,
    startedGroupsSet,
    groupPicks,
    thirdPicks,
    koPhases,
    koMatches,
    matchPicks,
  ] = await Promise.all([
    auth(),
    getUserPhaseScores(profile.id),
    getUserGroupTopPicks(profile.id),
    isGroupsPhaseRevealed(),
    getUserBadges(profile.id),
    getAllTeams(),
    getPhase("groups"),
    getMatchesByPhase("groups"),
    getStartedGroups(),
    getUserGroupPicks(profile.id),
    getUserThirdPicks(profile.id),
    db.select().from(phases).where(inArray(phases.id, ["r32", "r16", "qf", "sf", "final"])).orderBy(asc(phases.sortOrder)),
    db.select().from(matches).where(inArray(matches.phaseId, ["r32", "r16", "qf", "sf", "final"])).orderBy(asc(matches.kickoffAt)),
    getUserAllMatchPicks(profile.id),
  ]);

  const isMe = session?.user?.id === profile.id;
  const totalPoints = phaseScores.reduce((acc, p) => acc + p.points, 0);
  const name = profile.displayName || profile.handle;

  // Picks revealed only post-lock (groups phase deadline passed).
  const canSeePicks = groupsRevealed || isMe;

  const teamsById = Object.fromEntries(allTeams.map((t) => [t.id, t]));

  const teamsByGroup: Record<string, typeof allTeams> = {};
  for (const l of GROUP_LETTERS) teamsByGroup[l] = [];
  for (const t of allTeams) teamsByGroup[t.groupLetter]?.push(t);

  const pickedByGroup: Record<string, Array<{ teamId: string; predictedPos: number }>> = {};
  for (const p of groupPicks) {
    (pickedByGroup[p.groupLetter] ??= []).push(p);
  }

  const initialOrders: Record<string, string[]> = {};
  for (const l of GROUP_LETTERS) {
    const groupTeams = teamsByGroup[l] ?? [];
    const uPicks = (pickedByGroup[l] ?? []).sort((a, b) => a.predictedPos - b.predictedPos);
    if (uPicks.length === 4) {
      initialOrders[l] = uPicks.map((p) => p.teamId);
    } else {
      initialOrders[l] = groupTeams.map((t) => t.id);
    }
  }

  const matchesByGroup: Record<string, typeof allGroupsMatches> = {};
  for (const m of allGroupsMatches) {
    const t = allTeams.find((x) => x.id === m.homeTeamId);
    if (t) {
      (matchesByGroup[t.groupLetter] ??= []).push(m);
    }
  }

  const groupsData = {
    initialOrders,
    initialThirds: thirdPicks,
    deadline: groupsPhase?.locksAt.toISOString() ?? "",
    startedGroups: Array.from(startedGroupsSet),
    matchesByGroup,
  };

  const koMatchesByPhase: Record<string, typeof koMatches> = {};
  for (const m of koMatches) {
    (koMatchesByPhase[m.phaseId] ??= []).push(m);
  }

  const koPicksByPhase: Record<string, Record<string, string>> = {};
  for (const p of matchPicks) {
    if (!koPicksByPhase[p.phaseId]) koPicksByPhase[p.phaseId] = {};
    koPicksByPhase[p.phaseId][p.matchId] = p.predictedWinnerId!;
  }

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
          <div className="flex flex-col gap-2">
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(
                `Ma carte de picks ${isMe ? "" : `de @${profile.handle} `}pour la WC26 — `,
              )}${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/u/${profile.handle}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-x btn-sm"
            >
              <XIcon />
              {isMe ? "Partager ma carte" : "Partager"}
            </a>
            <a
              href={`https://x.com/${profile.handle}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <XIcon />
              Voir sur X
            </a>
          </div>
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

      {/* Achievements */}
      <section className="mb-7">
        <SectionLabel num="ACH.">Badges &amp; faits d&rsquo;armes</SectionLabel>
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <Badge
            icon="⚡"
            title="Premier locké"
            sub="Picks lockés > 24h avant la deadline"
            unlocked={badges.firstLocked}
          />
          <Badge
            icon="🎯"
            title="Madame Irma"
            sub="≥ 9/12 tops de groupes exacts"
            unlocked={badges.madameIrma}
          />
          <Badge
            icon="🥉"
            title="Le 3ème œil"
            sub="≥ 6/8 meilleurs 3èmes corrects"
            unlocked={badges.troisiemeOeil}
          />
          <Badge
            icon="👑"
            title="Royaume"
            sub="Champion du monde prédit correctement"
            unlocked={badges.royaume}
          />
        </div>
      </section>

      {/* Picks */}
      <section>
        <div className="flex items-baseline justify-between mb-3.5">
          <SectionLabel num="CARTE">Carte de picks</SectionLabel>
          <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)]">
            {groupTops.length}/12 GROUPES
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
            🔒 Les picks de ce joueur deviendront publics après le coup d&rsquo;envoi.
          </div>
        ) : (
          <PublicPicks
            teamsById={teamsById}
            groupsData={groupsData}
            koPhases={koPhases}
            koMatchesByPhase={koMatchesByPhase}
            koPicksByPhase={koPicksByPhase}
          />
        )}
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
