"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/db/schema";
import { Display } from "@/components/ui/Display";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProgressDial } from "@/components/ui/ProgressDial";
import { TeamFlag } from "@/components/ui/TeamFlag";
import { LockIcon } from "@/components/ui/icons";
import { formatPhaseDeadline } from "@/lib/format";
import { lockKoPhase, saveMatchPick, unlockKoPhase } from "./actions";

type MatchView = {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  kickoffAt: string | null;
};

type Info =
  | { num: string; matches: number; pts: string; sectionLabel: string }
  | undefined;

type Props = {
  phaseId: string;
  labelFr: string;
  info: Info;
  matches: MatchView[];
  teamsById: Record<string, Team>;
  initialPicks: Record<string, string>;
  deadlinePassed: boolean;
  userLocked: boolean;
  deadline: string;
};

export function BracketPicker({
  phaseId,
  labelFr,
  info,
  matches,
  teamsById,
  initialPicks,
  deadlinePassed,
  userLocked,
  deadline,
}: Props) {
  const readOnly = deadlinePassed || userLocked;
  const router = useRouter();
  const [picks, setPicks] = useState<Record<string, string>>(initialPicks);
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);

  function pickWinner(matchId: string, teamId: string) {
    if (readOnly) return;
    const prev = picks[matchId];
    setPicks((p) => ({ ...p, [matchId]: teamId }));
    void saveMatchPick({
      phaseId: phaseId as "r32",
      matchId,
      winnerId: teamId,
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : String(e));
      setPicks((p) => {
        const next = { ...p };
        if (prev) next[matchId] = prev;
        else delete next[matchId];
        return next;
      });
    });
  }

  async function handleLock() {
    setError(null);
    setLocking(true);
    try {
      await lockKoPhase({ phaseId: phaseId as "r32" });
      router.push("/picks");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setLocking(false);
    }
  }

  async function handleUnlock() {
    setError(null);
    try {
      await unlockKoPhase({ phaseId: phaseId as "r32" });
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const total = matches.length;
  const done = useMemo(
    () => matches.reduce((acc, m) => acc + (picks[m.id] ? 1 : 0), 0),
    [matches, picks],
  );
  const canLock = total > 0 && done === total && !locking;

  return (
    <>
      <div className="px-6 lg:px-10 pt-8 pb-3">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            {info && <SectionLabel num={info.num}>Phase {info.sectionLabel}</SectionLabel>}
            <Display
              size={56}
              className="mt-3.5"
              style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
            >
              {labelFr}.{" "}
              <span style={{ color: "var(--paper-3)" }}>
                {info ? `${info.matches} tap.` : ""}
              </span>
            </Display>
            {info && (
              <p className="text-[13px] mt-2.5 text-[color:var(--paper-2)] max-w-[460px]">
                {info.pts}
              </p>
            )}
          </div>
          {total > 0 && (
            <ProgressDial
              filled={done}
              total={total}
              label="MATCHS PICKÉS"
              sub={
                done === total ? "Prêt à lock." : `Plus que ${total - done}.`
              }
            />
          )}
        </div>
      </div>

      {error && (
        <div
          className="mx-6 lg:mx-10 mt-3 p-3 rounded-md text-[13px] flex items-start gap-3"
          style={{
            background: "var(--ink-3)",
            border: "1px solid var(--canada)",
          }}
        >
          <span style={{ color: "var(--canada)" }}>⚠</span>
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ color: "var(--paper-3)" }}
          >
            ×
          </button>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="px-6 lg:px-10 mt-8 mb-16">
          <div
            className="p-8 rounded-[12px] text-center"
            style={{ background: "var(--ink-2)", border: "1px dashed var(--line-strong)" }}
          >
            <div className="font-display text-[44px] leading-none mb-3">
              Affiches inconnues.
            </div>
            <p className="text-[color:var(--paper-3)] text-[14px] max-w-md mx-auto">
              Le bracket de cette phase est déterminé par la phase précédente.
              Il apparaîtra ici dès que l&rsquo;admin saisira les résultats.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 lg:px-10 mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {matches.map((m, idx) => (
              <MatchCard
                key={m.id}
                match={m}
                idx={idx + 1}
                teamsById={teamsById}
                picked={picks[m.id]}
                readOnly={readOnly}
                onPick={(teamId) => pickWinner(m.id, teamId)}
              />
            ))}
          </div>

          {!readOnly && (
            <div
              className="mx-6 lg:mx-10 mt-8 mb-16 px-6 py-5 rounded-[10px] flex flex-wrap items-center justify-between gap-4"
              style={{
                background: "var(--ink-3)",
                border: "1px solid var(--line-strong)",
              }}
            >
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.13em] text-[color:var(--paper-3)]">
                  LOCK · {formatPhaseDeadline(deadline)}
                </div>
                <div className="text-[14px] text-[color:var(--paper-2)] mt-1">
                  Une fois locké, plus aucune mutation possible sur cette phase.
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--paper-2)] tabular-nums">
                  <span className="text-[color:var(--paper-1)] text-[18px] font-display">
                    {done}
                  </span>
                  <span> / {total}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLock}
                  disabled={!canLock}
                  className="btn btn-lock btn-lg disabled:opacity-50"
                >
                  <LockIcon />
                  {locking ? "LOCK…" : `Lock mes ${total} picks`}
                </button>
              </div>
            </div>
          )}

          {userLocked && (
            <div
              className="mx-6 lg:mx-10 mt-6 mb-16 p-5 rounded-md flex items-center justify-between gap-4 flex-wrap"
              style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
            >
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.13em] text-[color:var(--paper-3)]">
                  ✓ TU AS LOCKÉ {phaseId.toUpperCase()}
                </div>
                <div className="text-[14px] text-[color:var(--paper-2)] mt-1">
                  {deadlinePassed
                    ? "Trop tard pour modifier — la deadline serveur est passée."
                    : `Tu peux encore les modifier jusqu'au ${formatPhaseDeadline(deadline)}.`}
                </div>
              </div>
              {!deadlinePassed && (
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="btn btn-ghost btn-md"
                >
                  ← Modifier mes picks
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

function MatchCard({
  match,
  idx,
  teamsById,
  picked,
  readOnly,
  onPick,
}: {
  match: MatchView;
  idx: number;
  teamsById: Record<string, Team>;
  picked: string | undefined;
  readOnly: boolean;
  onPick: (teamId: string) => void;
}) {
  const home = match.homeTeamId ? teamsById[match.homeTeamId] : null;
  const away = match.awayTeamId ? teamsById[match.awayTeamId] : null;
  const kickoffDate = match.kickoffAt ? new Date(match.kickoffAt) : null;
  const kickoff = kickoffDate
    ? kickoffDate.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const matchStarted = kickoffDate ? kickoffDate.getTime() <= Date.now() : false;
  const matchReadOnly = readOnly || matchStarted;

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <span
          className="font-mono flex items-center gap-2"
          style={{ fontSize: 10, letterSpacing: 1.2, color: "var(--paper-4)" }}
        >
          MATCH {String(idx).padStart(2, "0")}
          {matchStarted && !readOnly && <span title="Match commencé" style={{ color: "var(--canada)" }}>🔒</span>}
        </span>
        {kickoff && (
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "var(--paper-3)" }}
          >
            {kickoff}
          </span>
        )}
      </div>
      <MatchSide
        team={home}
        picked={picked === home?.id}
        disabled={matchReadOnly || !home}
        onClick={() => home && onPick(home.id)}
      />
      <div style={{ height: 1, background: "var(--line)" }} />
      <MatchSide
        team={away}
        picked={picked === away?.id}
        disabled={matchReadOnly || !away}
        onClick={() => away && onPick(away.id)}
      />
    </div>
  );
}

function MatchSide({
  team,
  picked,
  disabled,
  onClick,
}: {
  team: Team | null;
  picked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full grid items-center text-left gap-2 px-3 py-2.5 transition-colors"
      style={{
        gridTemplateColumns: "auto auto 1fr auto",
        background: picked ? "var(--ink-3)" : "transparent",
        borderLeft: picked
          ? "2px solid var(--mexico)"
          : "2px solid transparent",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {team ? (
        <TeamFlag code={team.id} height={14} />
      ) : (
        <span style={{ color: "var(--paper-4)" }}>·</span>
      )}
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: 0.5,
          color: picked ? "var(--paper-1)" : "var(--paper-3)",
        }}
      >
        {team?.id ?? "—"}
      </span>
      <span
        className="text-[12px] truncate"
        style={{ color: picked ? "var(--paper-1)" : "var(--paper-2)" }}
      >
        {team?.nameFr ?? "—"}
      </span>
      {picked && (
        <span
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: 0.8, color: "var(--mexico)" }}
        >
          ✓
        </span>
      )}
    </button>
  );
}
